# AWS SQS Queue Types Visualizer

An interactive web application that demonstrates the different types of Amazon SQS queues and their behaviors, including Standard Queues, FIFO Queues, and Dead Letter Queues.

## Features

- **Interactive Queue Switching**: Toggle between Standard, FIFO, and Dead Letter Queue types
- **Real-time Message Flow**: Watch messages move through the queue lifecycle
- **Message Processing Simulation**: See how messages are processed, succeed, or fail
- **Queue-Specific Behaviors**: Experience the unique characteristics of each queue type
- **Performance Metrics**: Track messages sent, processed, and failed
- **Code Examples**: Real AWS SDK code snippets for each operation

## Queue Types Demonstrated

### Standard Queue
- **Throughput**: Nearly unlimited messages per second
- **Delivery**: At-least-once (may receive duplicates)
- **Ordering**: Best-effort ordering (not guaranteed)
- **Use Cases**: High-volume, fault-tolerant applications

### FIFO Queue
- **Throughput**: Up to 3,000 messages per second
- **Delivery**: Exactly-once processing
- **Ordering**: Strict FIFO ordering guaranteed
- **Deduplication**: Built-in message deduplication
- **Message Groups**: Parallel processing within groups
- **Use Cases**: Financial transactions, order processing

### Dead Letter Queue
- **Purpose**: Handle messages that can't be processed successfully
- **Trigger**: After maximum receive count is exceeded
- **Benefits**: Isolate problematic messages for analysis
- **Monitoring**: Essential for debugging and alerting
- **Use Cases**: Error handling, debugging, message recovery

## How to Run

1. Open `index.html` in your web browser
2. Select a queue type using the buttons at the top
3. Send individual messages or batch messages
4. Watch the message processing simulation
5. Try simulating failures to see Dead Letter Queue behavior

## Interactive Features

### Message Operations
- **Send Message**: Add a single message to the queue
- **Send Batch**: Add 10 messages at once
- **Simulate Failure**: Force a processing failure
- **Clear Queue**: Reset all messages and stats

### Visual Elements
- **Color-coded Messages**: Different colors for each queue type
- **Processing Animation**: See messages being processed in real-time
- **Flow Visualization**: Producer → Queue → Consumer flow
- **Live Metrics**: Real-time statistics and counters

## Key Learning Points

### Standard Queue Behavior
- Messages may arrive out of order
- Possible duplicate delivery
- High throughput capabilities
- Best for fault-tolerant systems

### FIFO Queue Behavior
- Strict message ordering
- Exactly-once processing
- Message deduplication
- Message group parallelism
- Lower throughput but guaranteed consistency

### Dead Letter Queue Behavior
- Automatic failure handling
- Message retry mechanisms
- Error isolation and analysis
- Essential for robust systems

## Code Examples Included

The visualizer includes real AWS SDK code examples for:
- Sending messages to SQS
- Receiving and processing messages
- Batch operations
- Queue configuration

## Understanding the Visualization

### Message States
- **Queued**: Waiting in the queue (white background)
- **Processing**: Currently being processed (animated)
- **Processed**: Successfully completed (green)
- **Failed**: Processing failed, returned to queue (red)
- **Dead Letter**: Sent to DLQ after max retries (dark red)

### Queue Properties
Each queue type displays its key characteristics:
- Throughput capabilities
- Delivery guarantees
- Ordering behavior
- Special features

## Educational Value

Perfect for:
- **Cloud architects** designing message-driven systems
- **Developers** learning AWS SQS concepts
- **Students** studying distributed systems
- **Teams** debugging SQS-related issues
- **Anyone** wanting to understand queue behaviors visually

## Technical Implementation

- Pure HTML, CSS, and JavaScript
- No external dependencies
- Responsive design for mobile and desktop
- Real-time animations and state management
- Simulated AWS SQS behaviors

## Browser Compatibility

Works in all modern browsers:
- Chrome, Firefox, Safari, Edge
- Mobile browsers supported
- No plugins or installations required

Start exploring AWS SQS queue types with this interactive visualizer!