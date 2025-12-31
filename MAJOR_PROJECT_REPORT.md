# REAL-TIME COLLABORATIVE CODE EDITOR
## Major Project Report

**Submitted in partial fulfillment of the requirement for the award of Degree of**
**BACHELOR OF TECHNOLOGY In**
**COMPUTER SCIENCE & ENGINEERING**

**Submitted to**

**RAJIV GANDHI PROUDYOGIKI VISHWAVIDHYALAYA, BHOPAL (M.P.)**

**Submitted by**
**OMPRAKASH, RAHUL KUMAR YADAV**

**Under the Supervision of**
**Guide Name- ……………………...**

**Department of Computer Science & Engineering**
**PATEL COLLEGE OF SCIENCE & TECHNOLOGY, BHOPAL**
**Session 2025**

---

### CERTIFICATE

This is to certify that **OMPRAKASH (0128CS221068)** and **Rahul Kumar Yadav (0128CS221081)** of B. Tech Final year, Computer Science & Engineering have completed their major project entitled **REAL-TIME COLLABORATIVE CODE EDITOR** during the year 2025.

Guided & approved by:

Prof. Guide Name
Dept. of Computer Science & Engg. PCST, Bhopal

HOD NAME
Head of Dept. Computer Science & Engg. PCST, Bhopal

---

### APPROVAL CERTIFICATE

I approve the project for the submission for the partial fulfillment of the requirement for the award of degree Bachelor of Technology in Computer Science & Engineering.

**Internal Examiner**
Date:

**External Examiner**
Date:

---

### DECLARATION BY CANDIDATE

Students **Omprakash (0128CS221068)** and **Rahul Kumar Yadav (0128CS221081)** of Bachelor of Technology, Computer Science & Engineering Branch CSE, PATEL COLLEGE OF SCIENCE & TECHNOLOGY, Bhopal hereby declare that the work presented in this Major project entitled **REAL-TIME COLLABORATIVE CODE EDITOR** is outcome of our own work, is bonafide, correct to the best of our knowledge and this work has been carried out taking care of Engineering Ethics. The work presented does not infringe any patented work and has not been submitted to any University for the award of any degree or professional diploma.

---

### ACKNOWLEDGEMENT

I would like to express my sincere gratitude to my project guide, for their invaluable guidance, encouragement, and support throughout the duration of this project. Their insights were instrumental in shaping the architecture of this collaborative platform. I also thank the Department of Computer Science for providing the necessary infrastructure and resources to complete this project. Finally, I thank my family and friends for their constant motivation.

---

### ABSTRACT

In the modern software development landscape, remote collaboration has become a necessity rather than a luxury. Traditional methods of code sharing—via email or version control repositories—often lack the immediacy required for pair programming and real-time debugging. This project, the Real-Time Collaborative Code Editor, addresses this gap by providing a web-based platform where multiple developers can write, edit, and execute code simultaneously in a shared virtual environment.

The system leverages **Socket.IO** for low-latency, bi-directional communication, ensuring that changes made by one user are instantly reflected across all connected clients. The backend is built on **Node.js** and **Express**, utilizing **MongoDB** for persistent storage of code sessions. A critical feature of the system is the integration of the **Judge0 API**, allowing users to compile and run code in multiple languages (C, C++, Java, Python, etc.) within a secure sandbox. The application features a dual-screen interface (Screen A & B) to facilitate side-by-side development and includes optimization algorithms like debouncing and auto-cleanup cron jobs to maintain system performance. This report details the design, implementation, and testing of the system, demonstrating its efficacy as a tool for synchronous distributed development.

---

### TABLE OF CONTENTS

**Chapter 1: Introduction**
1.1 Overview and Contextual Background
1.2 Objective
1.3 Scope
1.4 Purpose
1.5 Detailed Problem Statement
1.6 Proposed Solution

**Chapter 2: System Analysis and Design**
2.1 System Architecture
2.2 E-R Diagram (Entity-Relationship)
2.3 Data Flow Diagrams (DFD)
2.4 Flow Chart Diagram
2.5 Resource Optimization & Automated Cleanup

**Chapter 3: Implementation Requirements**
3.1 Front-End Technologies
3.2 Back-End Technologies
3.3 External Integrations (Compiler)

**Chapter 4: Layout and Structure**
4.1 Coding Structure
4.2 Snapshot Analysis
4.3 Database Schema
4.4 Detailed Logic Breakdown (Create/Join/Leave)

**Chapter 5: Application and Evaluation**
5.1 Advantages
5.2 Disadvantages
5.3 Applications
5.4 Comparative Analysis

**Chapter 6: Conclusion and Future Work**
6.1 Conclusion
6.2 Future Work

**References**

---

# CHAPTER 1: INTRODUCTION

## 1.1 Overview and Contextual Background
The evolution of software engineering is increasingly moving towards distributed teams and remote work. However, the tools for real-time collaboration have not kept pace with the demand. While Google Docs revolutionized document editing by allowing multiple users to type simultaneously, the coding world largely relies on asynchronous tools like Git, where changes are pushed and pulled rather than streamed in real-time.

The **Real-Time Collaborative Code Editor** is a web-based Integrated Development Environment (IDE) designed to fill this void. It creates a virtual "Room" where developers can join via a unique ID. Once inside, they can type code, see each other's cursors, and execute programs instantly. This moves the paradigm from "turn-based" coding to "simultaneous" coding, essential for interviews, teaching, and pair programming.

## 1.2 Objective
The primary objectives of this project are multi-dimensional:
1.  **Real-Time Synchronization**: To implement a low-latency communication protocol using WebSockets that synchronizes text across multiple clients within milliseconds.
2.  **Remote Code Execution**: To provide a secure environment where users can compile and run code in C, C++, Java, and Python without installing local compilers.
3.  **Collaborative Workspace**: To design a dual-pane editor (Editor A and Editor B) that allows users to work on different files or compare algorithms side-by-side.
4.  **State Persistence**: To ensure that code is not lost during network interruptions by implementing auto-save mechanisms backed by a NoSQL database.
5.  **Resource Management**: To implement automated cleanup scripts that remove stale sessions and code files to maintain server health.

## 1.3 Scope
The scope of the project covers the full stack of web application development:
*   **Frontend Scope**: Development of a responsive user interface using HTML5, CSS3, and JavaScript, integrating the Monaco Editor (VS Code engine) for syntax highlighting and IntelliSense.
*   **Backend Scope**: Implementation of a Node.js server to manage room logic, user connections, and API routing.
*   **Database Scope**: Utilization of MongoDB to store room states, preventing data loss.
*   **Execution Scope**: Integration with the Judge0 API to handle the complex task of compiling code safely in a sandboxed environment.

## 1.4 Purpose
The fundamental purpose of this project is to democratize collaborative coding.
*   **For Students**: It serves as a platform for group assignments where peers can teach each other by coding together.
*   **For Interviewers**: It replaces static whiteboards with a functional editor where candidates can run their code, providing a better assessment of their skills.
*   **For Professionals**: It acts as a quick prototyping tool for debugging snippets without the overhead of setting up a full repository.

## 1.5 Detailed Problem Statement
The conceptualization of this project stems from specific limitations in the existing ecosystem:

### 1.5.1 The "Setup Hell"
For a student or professional to run a piece of Java or C++ code, they strictly need a local compiler (JDK or GCC) installed. This sets a high barrier to entry. If a student is on a Chromebook or a library computer, they simply cannot code. **Problem:** Local environment dependency limits accessibility.

### 1.5.2 Latency in Traditional Web Apps
Traditional web applications utilize the HTTP Request-Response model. If used for collaboration, a client would have to "poll" the server ("Is there new code?") every second.
*   **Consequence:** This results in significant latency (lag), making the typing experience feel "jumpy" and unnatural.
*   **Server Load:** It causes massive server overload due to thousands of redundant checks.
*   **Problem:** HTTP is stateless and inefficient for real-time streams.

### 1.5.3 Fragmented Workflow
Currently, a remote pair programming session involves:
1.  Zoom/Teams for voice communication.
2.  Slack/Discord for pasting code snippets.
3.  A local IDE for running the code.
**Problem:** This "Context Switching" breaks concentration and lowers productivity.

### 1.5.4 Stale Data Accumulation
In many temporary coding environments, data persists indefinitely, clogging the database with millions of abandoned "Hello World" snippets.
**Problem:** Lack of automated data hygiene leads to performance degradation and increased storage costs over time.

## 1.6 Proposed Solution
We propose a unified platform that solves these issues through:
1.  **WebSocket Architecture**: Using Socket.IO to keep a persistent open connection. The server pushes updates *only* when they happen, reducing latency to <50ms.
2.  **Cloud Compilation**: Offloading the compilation process to a remote API (Judge0). Users can run C++ code on a mobile phone because the heavy lifting is done by the server.
3.  **Automated Cleanup (Cron Jobs)**: Implementing a server-side "Garbage Collector" that runs every 15 minutes to delete rooms and files that haven't been accessed in 6 hours.
4.  **Ephemeral User Sessions**: A robust system to track who is in the room and handle "graceful exits" (updating the database when a user closes the tab).

---

# CHAPTER 2: SYSTEM ANALYSIS AND DESIGN

## 2.1 System Architecture
The system follows a Client-Server Architecture facilitated by a WebSocket layer for real-time events.

*   **The Client (Browser)**: Captures keystrokes and sends them as events. It also listens for incoming updates to update the editor view.
*   **The Server (Node.js)**: Acts as the central broadcaster. It receives a change from User A and instantly "broadcasts" it to User B and User C in the same room.
*   **The Compiler Service (Judge0)**: An external microservice that executes untrusted code in a secure container, returning the output or error logs.

### Layered Diagram
```
[User Browser] <---> [Notification Layer (Socket.IO)] <---> [Business Logic Layer (Node.js)]
                                         |
                                         v
                              [Data Persistence Layer (MongoDB)]
                                         |
                                         v
                              [Execution Layer (Judge0 API)]
```

## 2.2 E-R Diagram (Entity-Relationship)
The database design is streamlined to support high-speed reads and writes.

### Entities Identified:
1.  **Room**: The core entity representing a collaborative session.
    *   Attributes: `roomId`, `language`, `codeA`, `codeB`, `createdAt`, `members`.
2.  **File**: Stores the persistent code state to be retrieved if the room is re-opened.
    *   Attributes: `roomId`, `code`, `lastUpdated`.
3.  **UserSession**: Tracks active connections for analytics and presence.
    *   Attributes: `userId`, `roomId`, `joinedAt`.

### Relationships:
*   **Room has One File** (1:1)
*   **Room has Many UserSessions** (1:N)

**Visual Schema Table:**
| Entity | Primary Key | Foreign Key | Description |
| :--- | :--- | :--- | :--- |
| **Room** | roomId | - | Holds main session state and settings |
| **File** | _id | roomId | Holds the actual content (versioning support) |
| **UserSession** | _id | roomId | Temporary record of active users |

## 2.3 Data Flow Diagrams (DFD)

### Level 0 DFD (Context Diagram)
*   **Input**: User types character 'X'.
*   **Process**: Collaborative Code Editor System.
*   **Output**: Character 'X' appears on Peer Screen.

### Level 1 DFD (Detailed Flow)
1.  **Event Generation**: `frontend/EditorA.js` captures the `onChange` event (Monaco API).
2.  **Emission**: `socket.emit('code_change', data)` sends data to the Node.js server.
3.  **Server Handling**: Server receives data, resets the **Debounce Timer** (to prevent database spam), and caches the change in memory.
4.  **Broadcasting**: Server sends `socket.to(room).emit('code_update', data)` to all other clients.
5.  **Rendering**: Receiving client applies the edit.

## 2.4 Flow Chart Diagram
This chart details the logic for the "Join Room" process:

1.  **Start**
2.  User enters Room ID.
3.  **Check DB**: Does Room ID exist?
    *   **No**: Return Error "Room Not Found".
    *   **Yes**: Retrieve `codeA` (Editor A) and `codeB` (Editor B).
4.  **Socket Handshake**: Upgrade HTTP to WebSocket.
5.  **Sync**: Send `init_state` payload to client.
## 2.5 Use Case Diagram
The Use Case diagram identifies the primary actors and their interactions with the system.

*   **Actors**: User (Editor), Server (System), Judge0 API (External).
*   **Use Cases**:
    *   **Create Room**: User initiates a session.
    *   **Join Room**: User enters a session via ID.
    *   **Edit Code**: User types in the editor.
    *   **Compile Code**: User requests execution.
    *   **View Output**: System displays results.
    *   **Auto-Save**: System saves code to DB.

## 2.6 Sequence Diagram
This diagram models the timing of the "Code Change" event.

1.  **User A** types character `k`.
2.  **Browser A** sends `emit('code_change', 'k')` to Server.
3.  **Server** processes event.
4.  **Server** sends `broadcast('code_update', 'k')` to **User B**.
5.  **Browser B** updates UI.
6.  **Server** starts **Debounce Timer**.
7.  Timer expires -> Server calls `saveToDB()`.
8.  **Database** acknowledges save.

## 2.7 Activity Diagram
The activity flow for the Compilation Process:

*   **Start** -> User clicks "Run".
*   **Step 1**: Client bundles `source_code`, `language_id`, and `stdin`.
*   **Step 2**: Client encodes data to Base64.
*   **Step 3**: HTTP POST request sent to Server.
*   **Step 4**: Server forwards request to Judge0 API.
*   **Step 5**: Judge0 executes code in Sandbox.
*   **Decision**: Compilation Error?
    *   **Yes**: Return `stderr`.
    *   **No**: Execute and return `stdout`.
*   **Step 6**: Server sends JSON response to Client.
*   **End**.

## 2.5 Resource Optimization & Automated Cleanup
One of the key features requested is the intelligent management of resources. Since users create temporary rooms that they may never return to, the database can grow infinitely.

**The Solution: Cron Job Strategy**
We utilize the `node-cron` library to schedule a background task.
*   **Schedule**: Runs every 15 minutes (`*/15 * * * *`).
*   **Expiry Threshold**: 6 Hours.
*   **Logic**:
    1.  Calculate a timestamp `expiryDate = (Current Time - 6 Hours)`.
    2.  Query MongoDB for all `File` documents where `lastUpdated < expiryDate`.
    3.  Extract the `roomId`s from these stale files.
    4.  **Bulk Delete**: Remove the associated `Room` documents, `UserSession` documents, and the `File` documents themselves.
    5.  Log the result (e.g., "Deleted 5 stale rooms").

**Benefits**:
*   Keeps MongoDB storage costs low.
*   Prevents ID collision (eventually reuse IDs).
*   Maintains query performance by keeping indices small.

---

# CHAPTER 3: IMPLEMENTATION REQUIREMENTS

## 3.1 Front-End Technologies
The frontend is the presentation layer, responsible for the user experience.
*   **HTML5 & CSS3**: Used for the semantic structure and styling. A dark theme was chosen to reduce eye strain for developers. Flexbox and Grid layouts ensure the application is responsive.
*   **Monaco Editor**: This is the engine that powers VS Code.
    *   **Reason for Choice**: It provides professional features like syntax highlighting for 50+ languages, auto-indentation, minimap, and error "squiggles". It is far superior to simple `<textarea>` elements.
*   **Socket.IO Client (`socket.io-client`)**: A JavaScript library that enables real-time communication. It handles automatic reconnection if the internet drops and maintains the "heartbeat".

## 3.2 Back-End Technologies
The backend handles the business logic and data persistence.
*   **Node.js**: A JavaScript runtime built on Chrome's V8 engine.
    *   **Relevance**: Its non-blocking, Event Loop architecture is perfect for real-time applications where thousands of small messages are passed concurrently.
*   **Express.js**: A minimal web framework for Node.js. Used for the REST API endpoints (`/room/create`, `/compile`).
*   **MongoDB (Mongoose ODM)**: A NoSQL database.
    *   **Relevance**: Collaborative data is often unstructured or semi-structured. MongoDB's JSON-like documents map perfectly to JavaScript objects.

## 3.3 External Integrations (Compiler)
*   **Judge0 API**: An open-source online code execution system.
    *   **Security Model**: It executes code in isolated Docker containers. This prevents a malicious user from writing code like `os.system("rm -rf /")` to destroy our server. The sandbox absorbs the damage.

---

# CHAPTER 4: LAYOUT AND STRUCTURE

## 4.1 Coding Structure
The application follows a modular directory structure (MVC Pattern) to ensure maintainability.

**Project Root:**
*   `server.js`: The entry point. Initializes the server, DB connection, and Cron jobs.
*   `socket.js`: Contains all real-time event listeners. This separates the "Real-Time" logic from the "HTTP" logic.
*   `backend/routes/`:
    *   `room.js`: API to generate unique room IDs.
    *   `compile.js`: API to interface with Judge0.
*   `backend/models/`:
    *   `Room.js`: Mongoose schema for Room settings.
    *   `File.js`: Mongoose schema for Code content.
    *   `UserSession.js`: Schema for tracking active users.

## 4.3 Database Schema Detail
The `Room.js` schema is defined as:

```javascript
const RoomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true // Indexed for fast lookup
    },
    members: {
        type: [String], // Array of Socket IDs
        default: []
    },
    // ... codeA and codeB fields
});
```

**Note on Indexing**: The `index: true` on `roomId` is crucial. Without it, joining a room would require scanning the entire database (O(N)). With it, lookup is O(log N).

## 4.4 Detailed Logic Breakdown

### 4.4.1 Room Creation (The "Handshake")
When a user clicks "Create Room":
1.  Frontend sends POST request.
2.  Backend generates ID (e.g., "xy92").
3.  Backend creates `Room` doc and `File` doc.
4.  Frontend redirects to `/?roomId=xy92`.
5.  **Auto-Join**: The frontend reads the URL param and immediately emits `join_room`.

### 4.4.2 Handling User Disconnection (Graceful Exit)
What happens when a user closes the tab?
*   **The Problem**: The socket connection breaks abruptly.
*   **The Handling**:
    1.  `socket.on('disconnect')` is triggered automatically on the server.
    2.  We lookup the `socket.id` in our `socketRoomMap` (a generic Map in memory).
    3.  We find the `roomId` they were in.
    4.  We execute `Room.updateOne(..., { $pull: { members: userId } })` to remove them from the member list.
    5.  We emit `user_left` to the remaining users so they know their peer has routed away.

---

# CHAPTER 5: APPLICATION AND EVALUATION

## 5.1 Advantages
The Real-Time Collaborative Code Editor offers significant improvements over standard coding practices:
1.  **Instant Collaboration**: Eliminates the need for screen sharing or emailing code snippets. Feedback is immediate (sub-100ms).
2.  **Zero-Setup Environment**: Users can write and run C++ or Java code from any computer (even a tablet) without installing heavy compilers.
3.  **Efficiency**: The dual-screen mode allows for multitasking (e.g., HTML on Left, CSS on Right).
4.  **Network Resilience**: The Auto-Save feature ensures that even if a user's browser crashes, their code is safely stored in MongoDB.
5.  **Self-Cleaning**: The logical implementation of the 6-hour cleanup rule means the system requires zero maintenance from the administrator.

## 5.2 Disadvantages
Despite its robustness, the system has certain limitations:
1.  **Online Dependency**: It requires an active internet connection.
2.  **Conflict Resolution**: It uses "Last Write Wins". If two users type on the same line simultaneously, one might overwrite the other. (Future solution: Operational Transformation or CRDTs).
3.  **Compilation Latency**: Running code remotely takes 1-2 seconds more than running it locally.

## 5.3 Applications
*   **Technical Interviews**: Companies (like HackerRank) use similar systems to watch candidates think and code.
*   **Education**: CS Professors can project the room onto a big screen, and students can join the same room to copy the code instantly.
*   **Hackathons**: Teams can pair-program rapidly.

---

---

# CHAPTER 6: SYSTEM TESTING

## 6.1 Testing Methodology
To ensure the reliability of the application, rigorous testing was performed at multiple levels.

*   **Unit Testing**: Individual components, such as the `generateRoomId()` function and the Base64 encoding logic, were tested in isolation to ensure they return expected values.
*   **Integration Testing**: The interaction between the Node.js server and the MongoDB database was tested to verify that rooms are correctly created and retrieved.
*   **System Testing**: The complete flow, from joining a room to compiling code, was tested to ensure all components work together seamlessly.

## 6.2 Test Cases
The following test cases document the validation of the system's core features.

### Table 6.1: Login and Room Management Test Cases

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Create Room | 1. Open Landing Page<br>2. Click "Create Room" | Redirect to Editor with new Room ID | Redirected successfully | **Pass** |
| **TC-02** | Join Valid Room | 1. Enter valid ID<br>2. Click "Join" | Load Editor with existing code | Code loaded correctly | **Pass** |
| **TC-03** | Join Invalid Room | 1. Enter invalid ID<br>2. Click "Join" | Show "Room not found" error | Error alert displayed | **Pass** |

### Table 6.2: Collaboration Test Cases

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-04** | Real-Time Sync | 1. User A types "Hello"<br>2. Observe User B screen | Text "Hello" appears on Screen B | Text appeared instantly | **Pass** |
| **TC-05** | Language Change | 1. User A selects "Python" | User B's dropdown changes to "Python" | Sync successful | **Pass** |

### Table 6.3: Compilation Test Cases

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-06** | Run Valid Code | 1. Write `print("Hi")` | Output "Hi" in console | Output received | **Pass** |
| **TC-07** | Syntax Error | 1. Write `print("Hi"` (missing bracket) | Error Log displayed in red | Error Log displayed | **Pass** |
| **TC-08** | Infinite Loop | 1. Write `while(True): pass` | Timeout error after 5s | Timeout received | **Pass** |

---

# CHAPTER 7: CONCLUSION AND FUTURE WORK

## 6.1 Conclusion
The Real-Time Collaborative Code Editor successfully achieves its goal of bridging the gap between coding and communication. By integrating Socket.IO for real-time synchronization and Judge0 for remote execution, the platform provides a seamless "Google Docs-like" experience for developers.

The project demonstrates the power of the MERN Stack (MongoDB, Express, React/Node) in building complex, event-driven applications. The implementation of specific optimizations like **Debouncing** and **Cron Job Cleanup** ensures that the system remains performant and cost-effective even as the user base grows. Ultimately, this tool simplifies the workflow for remote teams and enhances the learning process.

## 6.2 Future Work
To further enhance the system's capabilities, the following features are proposed:
*   **Voice/Video Chat**: Integrating WebRTC (PeerJS) to allow users to talk while coding.
*   **Git Integration**: Adding a button to "Push to GitHub" directly from the room.
*   **Intelligent Code Completion**: Integrating OpenAI Codex to provide AI-driven suggestions.
*   **Operational Transformation (OT)**: Implementing the OT algorithm (used by Google Docs) to allow seamless concurrent editing without overwrites.

---

# REFERENCES
1.  **Socket.IO Documentation**: https://socket.io/docs/v4
2.  **Monaco Editor API**: https://microsoft.github.io/monaco-editor/
3.  **Judge0 API**: https://ce.judge0.com/
4.  **MongoDB Manual**: https://www.mongodb.com/docs/manual/core/schema-validation/
5.  **Node-Cron**: https://www.npmjs.com/package/node-cron
