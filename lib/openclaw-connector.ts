/**
 * OpenClaw Connector - Communicate with OpenClaw Gateways
 * 
 * This module allows the Master Agent (Jason) to send messages
 * to other OpenClaw agents via their Gateway APIs.
 */

export interface OpenClawConfig {
  gatewayUrl: string;
  token: string;
  sessionKey?: string;
}

export interface OpenClawMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenClawResponse {
  success: boolean;
  content: string;
  model?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Send a message to an OpenClaw Gateway
 * Uses the OpenAI-compatible /v1/chat/completions endpoint
 */
export async function sendToAgent(
  config: OpenClawConfig,
  message: string,
  context?: {
    taskTitle?: string;
    taskDescription?: string;
    priority?: string;
    fromAgent?: string;
  }
): Promise<OpenClawResponse> {
  try {
    const baseUrl = config.gatewayUrl.replace(/\/$/, '');
    
    // Build contextual message
    let fullMessage = message;
    if (context) {
      const contextParts: string[] = [];
      if (context.fromAgent) {
        contextParts.push(`[From: ${context.fromAgent}]`);
      }
      if (context.taskTitle) {
        contextParts.push(`[Task: ${context.taskTitle}]`);
      }
      if (context.priority) {
        contextParts.push(`[Priority: ${context.priority}]`);
      }
      if (context.taskDescription) {
        contextParts.push(`\n\nTask Details:\n${context.taskDescription}`);
      }
      if (contextParts.length > 0) {
        fullMessage = `${contextParts.join(' ')}\n\n${message}`;
      }
    }

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`,
        'x-openclaw-session-key': config.sessionKey || 'nexus-task',
      },
      body: JSON.stringify({
        model: 'openclaw',
        messages: [
          { role: 'user', content: fullMessage }
        ],
        user: config.sessionKey || 'nexus-task',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenClaw Gateway error: ${response.status} - ${errorText}`);
      return {
        success: false,
        content: '',
        error: `Gateway error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No response from agent.';

    return {
      success: true,
      content,
      model: data.model || 'openclaw-gateway',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  } catch (error) {
    console.error('OpenClaw Gateway request failed:', error);
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Assign a task to an OpenClaw agent
 * Sends a structured task assignment message
 */
export async function assignTaskToAgent(
  config: OpenClawConfig,
  task: {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedBy: string;
    deadline?: string;
  }
): Promise<OpenClawResponse> {
  const message = `
## 📋 New Task Assignment

**Task ID:** ${task.id}
**Title:** ${task.title}
**Priority:** ${task.priority.toUpperCase()}
**Assigned by:** ${task.assignedBy}
${task.deadline ? `**Deadline:** ${task.deadline}` : ''}

### Description:
${task.description}

---
Please acknowledge receipt and provide your initial plan for completing this task.
`;

  return sendToAgent(config, message, {
    taskTitle: task.title,
    priority: task.priority,
    fromAgent: task.assignedBy,
  });
}

/**
 * Request status update from an OpenClaw agent
 */
export async function requestStatusUpdate(
  config: OpenClawConfig,
  taskId: string,
  taskTitle: string
): Promise<OpenClawResponse> {
  const message = `
## 📊 Status Update Request

**Task:** ${taskTitle} (${taskId})

Please provide a brief status update on this task:
1. Current progress (%)
2. What you've completed
3. Any blockers or issues
4. ETA for completion
`;

  return sendToAgent(config, message, {
    taskTitle,
    fromAgent: 'Jason (PM)',
  });
}

/**
 * Send feedback to an OpenClaw agent
 */
export async function sendFeedback(
  config: OpenClawConfig,
  feedback: {
    taskId: string;
    taskTitle: string;
    type: 'approval' | 'revision' | 'comment';
    message: string;
    fromAgent: string;
  }
): Promise<OpenClawResponse> {
  const typeEmoji = {
    approval: '✅',
    revision: '🔄',
    comment: '💬',
  };

  const fullMessage = `
## ${typeEmoji[feedback.type]} Task Feedback

**Task:** ${feedback.taskTitle} (${feedback.taskId})
**Type:** ${feedback.type.toUpperCase()}
**From:** ${feedback.fromAgent}

### Feedback:
${feedback.message}
`;

  return sendToAgent(config, fullMessage, {
    taskTitle: feedback.taskTitle,
    fromAgent: feedback.fromAgent,
  });
}

/**
 * Check if an OpenClaw Gateway is reachable
 */
export async function checkAgentHealth(
  config: OpenClawConfig
): Promise<{ online: boolean; latencyMs?: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    const baseUrl = config.gatewayUrl.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.token}`,
      },
    });

    const latencyMs = Date.now() - startTime;

    if (response.ok) {
      return { online: true, latencyMs };
    } else {
      return { 
        online: false, 
        latencyMs,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    return {
      online: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}
