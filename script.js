// SQS Queue Simulator
class SQSSimulator {
    constructor() {
        this.currentQueue = 'standard';
        this.messages = [];
        this.processingMessages = [];
        this.nextMessageId = 1;
        this.stats = {
            messagesSent: 0,
            messagesProcessed: 0,
            messagesFailed: 0
        };
        this.deadLetterQueue = [];
        this.maxReceiveCount = 3;
        
        this.initializeEventListeners();
        this.startMessageProcessor();
    }

    initializeEventListeners() {
        // Queue selector buttons
        document.querySelectorAll('.queue-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchQueue(e.target.dataset.queue);
            });
        });

        // Code tab buttons
        document.querySelectorAll('.code-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchCodeTab(e.target.dataset.tab);
            });
        });

        // Message input for FIFO
        document.getElementById('message-content').addEventListener('input', () => {
            if (this.currentQueue === 'fifo') {
                this.updateMessageGroupVisibility();
            }
        });
    }

    switchQueue(queueType) {
        this.currentQueue = queueType;
        
        // Update active button
        document.querySelectorAll('.queue-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-queue="${queueType}"]`).classList.add('active');

        // Update queue display
        this.updateQueueDisplay();
        
        // Update info panels
        document.querySelectorAll('.info-card').forEach(card => {
            card.style.display = 'none';
        });
        document.getElementById(`${queueType}-info`).style.display = 'block';

        // Show/hide message group input for FIFO
        this.updateMessageGroupVisibility();

        // Clear current messages and reset
        this.clearQueue();
    }

    updateMessageGroupVisibility() {
        const messageGroupInput = document.getElementById('message-group');
        if (this.currentQueue === 'fifo') {
            messageGroupInput.style.display = 'block';
            messageGroupInput.required = true;
        } else {
            messageGroupInput.style.display = 'none';
            messageGroupInput.required = false;
        }
    }

    updateQueueDisplay() {
        const titles = {
            standard: 'Standard Queue',
            fifo: 'FIFO Queue (.fifo)',
            dlq: 'Dead Letter Queue'
        };

        const properties = {
            standard: [
                'High Throughput',
                'At-least-once Delivery', 
                'Best-effort Ordering'
            ],
            fifo: [
                'Exactly-once Processing',
                'Strict FIFO Ordering',
                'Message Deduplication',
                'Message Groups'
            ],
            dlq: [
                'Failed Message Storage',
                'Error Analysis',
                'Monitoring & Alerts',
                'Message Recovery'
            ]
        };

        document.getElementById('queue-title').textContent = titles[this.currentQueue];
        
        const propertiesContainer = document.getElementById('queue-properties');
        propertiesContainer.innerHTML = properties[this.currentQueue]
            .map(prop => `<span class="property">${prop}</span>`)
            .join('');
    }

    generateMessageId() {
        return `msg-${this.nextMessageId++}-${Date.now()}`;
    }

    sendMessage() {
        const content = document.getElementById('message-content').value.trim();
        const messageGroup = document.getElementById('message-group').value.trim();

        if (!content) {
            alert('Please enter message content');
            return;
        }

        if (this.currentQueue === 'fifo' && !messageGroup) {
            alert('Message Group ID is required for FIFO queues');
            return;
        }

        const message = {
            id: this.generateMessageId(),
            content: content,
            messageGroup: messageGroup || null,
            timestamp: new Date().toISOString(),
            receiveCount: 0,
            queueType: this.currentQueue,
            status: 'queued'
        };

        // FIFO deduplication simulation
        if (this.currentQueue === 'fifo') {
            const duplicate = this.messages.find(m => 
                m.content === content && 
                m.messageGroup === messageGroup &&
                m.queueType === 'fifo'
            );
            
            if (duplicate) {
                this.logMessage(`Duplicate message detected and rejected: ${content}`, 'warning');
                return;
            }
        }

        // Add message based on queue type
        if (this.currentQueue === 'standard') {
            // Standard queue - random insertion to simulate best-effort ordering
            const randomIndex = Math.floor(Math.random() * (this.messages.length + 1));
            this.messages.splice(randomIndex, 0, message);
        } else {
            // FIFO and DLQ - strict ordering
            this.messages.push(message);
        }

        this.stats.messagesSent++;
        this.updateDisplay();
        this.logMessage(`Message sent: ${content}`, 'success');

        // Clear input
        document.getElementById('message-content').value = '';
        if (messageGroup) {
            document.getElementById('message-group').value = '';
        }
    }

    sendBatchMessages() {
        const baseContent = document.getElementById('message-content').value.trim() || 'Batch Message';
        const messageGroup = document.getElementById('message-group').value.trim() || 'batch-group';

        for (let i = 1; i <= 10; i++) {
            const message = {
                id: this.generateMessageId(),
                content: `${baseContent} ${i}`,
                messageGroup: this.currentQueue === 'fifo' ? messageGroup : null,
                timestamp: new Date().toISOString(),
                receiveCount: 0,
                queueType: this.currentQueue,
                status: 'queued'
            };

            if (this.currentQueue === 'standard') {
                const randomIndex = Math.floor(Math.random() * (this.messages.length + 1));
                this.messages.splice(randomIndex, 0, message);
            } else {
                this.messages.push(message);
            }
        }

        this.stats.messagesSent += 10;
        this.updateDisplay();
        this.logMessage(`Batch of 10 messages sent`, 'success');
    }

    startMessageProcessor() {
        setInterval(() => {
            this.processMessages();
        }, 2000); // Process messages every 2 seconds
    }

    processMessages() {
        if (this.messages.length === 0) return;

        // Get next message to process
        let messageToProcess;
        
        if (this.currentQueue === 'fifo') {
            // FIFO: Process by message group order
            const groups = [...new Set(this.messages.map(m => m.messageGroup))];
            const firstGroup = groups[0];
            messageToProcess = this.messages.find(m => m.messageGroup === firstGroup);
        } else {
            // Standard and DLQ: First available message
            messageToProcess = this.messages[0];
        }

        if (!messageToProcess) return;

        // Remove from queue and add to processing
        this.messages = this.messages.filter(m => m.id !== messageToProcess.id);
        messageToProcess.status = 'processing';
        messageToProcess.receiveCount++;
        this.processingMessages.push(messageToProcess);

        this.updateDisplay();
        this.logMessage(`Processing: ${messageToProcess.content}`, 'info');

        // Simulate processing time
        setTimeout(() => {
            this.completeMessageProcessing(messageToProcess);
        }, 3000);
    }

    completeMessageProcessing(message) {
        // Remove from processing
        this.processingMessages = this.processingMessages.filter(m => m.id !== message.id);

        // Random chance of failure for demonstration
        const shouldFail = Math.random() < 0.1; // 10% failure rate

        if (shouldFail && message.receiveCount < this.maxReceiveCount) {
            // Message failed, return to queue
            message.status = 'failed';
            this.messages.unshift(message); // Add back to front
            this.logMessage(`Processing failed: ${message.content} (attempt ${message.receiveCount})`, 'error');
        } else if (message.receiveCount >= this.maxReceiveCount) {
            // Send to Dead Letter Queue
            message.status = 'dead-letter';
            this.deadLetterQueue.push(message);
            this.stats.messagesFailed++;
            this.logMessage(`Message sent to DLQ: ${message.content}`, 'error');
        } else {
            // Successfully processed
            message.status = 'processed';
            this.stats.messagesProcessed++;
            this.logMessage(`Successfully processed: ${message.content}`, 'success');
        }

        this.updateDisplay();
    }

    simulateFailure() {
        if (this.processingMessages.length === 0) {
            this.logMessage('No messages currently processing', 'warning');
            return;
        }

        const message = this.processingMessages[0];
        this.processingMessages = this.processingMessages.filter(m => m.id !== message.id);
        
        if (message.receiveCount >= this.maxReceiveCount) {
            message.status = 'dead-letter';
            this.deadLetterQueue.push(message);
            this.stats.messagesFailed++;
            this.logMessage(`Message sent to DLQ after max retries: ${message.content}`, 'error');
        } else {
            message.status = 'failed';
            this.messages.unshift(message);
            this.logMessage(`Simulated failure: ${message.content} (attempt ${message.receiveCount})`, 'error');
        }

        this.updateDisplay();
    }

    clearQueue() {
        this.messages = [];
        this.processingMessages = [];
        this.deadLetterQueue = [];
        this.stats = {
            messagesSent: 0,
            messagesProcessed: 0,
            messagesFailed: 0
        };
        this.updateDisplay();
        this.logMessage('Queue cleared', 'info');
    }

    updateDisplay() {
        // Update stats
        document.getElementById('messages-count').textContent = this.messages.length;
        document.getElementById('messages-sent').textContent = this.stats.messagesSent;
        document.getElementById('messages-processed').textContent = this.stats.messagesProcessed;
        document.getElementById('messages-failed').textContent = this.stats.messagesFailed;

        // Update queue messages
        const queueMessagesContainer = document.getElementById('queue-messages');
        const messagesToShow = this.currentQueue === 'dlq' ? this.deadLetterQueue : this.messages;
        
        queueMessagesContainer.innerHTML = messagesToShow.map(message => `
            <div class="message ${message.queueType}" data-id="${message.id}">
                <div class="message-content">${message.content}</div>
                <div class="message-meta">
                    <span class="message-id">${message.id}</span>
                    <span>Attempts: ${message.receiveCount}</span>
                    ${message.messageGroup ? `<span>Group: ${message.messageGroup}</span>` : ''}
                </div>
            </div>
        `).join('');

        // Update processing messages
        const processingContainer = document.getElementById('processing-messages');
        processingContainer.innerHTML = this.processingMessages.map(message => `
            <div class="processing-message">
                ${message.content}
            </div>
        `).join('');

        if (this.processingMessages.length === 0) {
            processingContainer.innerHTML = '<div style="color: #666; font-style: italic;">No messages currently processing</div>';
        }
    }

    switchCodeTab(tabName) {
        // Update active tab
        document.querySelectorAll('.code-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show corresponding code
        document.querySelectorAll('.code-content pre').forEach(pre => {
            pre.style.display = 'none';
        });
        document.getElementById(`${tabName}-code`).style.display = 'block';
    }

    logMessage(message, type) {
        console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
        
        // You could add a visual log here if desired
        // For now, we'll just use console logging
    }
}

// Global functions for HTML onclick handlers
let sqsSimulator;

function sendMessage() {
    sqsSimulator.sendMessage();
}

function sendBatchMessages() {
    sqsSimulator.sendBatchMessages();
}

function simulateFailure() {
    sqsSimulator.simulateFailure();
}

function clearQueue() {
    sqsSimulator.clearQueue();
}

// Initialize simulator when page loads
document.addEventListener('DOMContentLoaded', () => {
    sqsSimulator = new SQSSimulator();
    
    // Set initial state
    sqsSimulator.switchQueue('standard');
    
    console.log('=== AWS SQS Queue Types Simulator ===');
    console.log('Standard Queue: High throughput, at-least-once delivery, best-effort ordering');
    console.log('FIFO Queue: Exactly-once processing, strict ordering, message deduplication');
    console.log('Dead Letter Queue: Failed message handling and analysis');
    console.log('=== Try the different queue types above! ===');
});