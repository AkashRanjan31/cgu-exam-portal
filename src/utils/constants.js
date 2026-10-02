// C. V. Raman Global University (CVRGU) Constants

export const UNIVERSITY_INFO = {
  name: 'C. V. Raman Global University',
  shortName: 'CVRGU',
  location: 'Bhubaneswar, Odisha, India',
  pin: '752054',
  established: '1997',
  accreditation: 'NAAC A Grade • Approved by AICTE • UGC Recognized',
  domain: '@cgu-odisha.ac.in',
  portalName: 'CVRGU Online Examination System',
  supportEmail: 'exam-support@cgu-odisha.ac.in',
  helpline: '+91 674 6636555',
  authorityTitle: 'Office of the Controller of Examinations'
};

export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Machine Learning',
  'Data Science',
  'Other'
];

// Demo credentials — only available in development builds, never in production
export const DEMO_CREDENTIALS = import.meta.env.DEV
  ? {
      student: {
        id: 's0',
        email: 'student@cgu-odisha.ac.in',
        demoKey: import.meta.env.VITE_DEMO_STUDENT_PASSWORD,
        name: 'Student Name',
        rollNumber: 'XXX XXXXXXX',
        registrationNumber: '2026CSE00001',
        department: 'Computer Science & Engineering',
        program: 'B.Tech',
        year: '3rd Year',
        semester: '5th Semester',
        batch: '2023–2027',
        status: 'Active',
        examEligibility: 'Eligible',
        registeredDate: '2026-08-12',
        role: 'student'
      },
      admin: {
        id: 'a0',
        email: 'admin@cgu-odisha.ac.in',
        demoKey: import.meta.env.VITE_DEMO_ADMIN_PASSWORD,
        name: 'Examination Controller',
        rollNumber: 'EMP-CVRGU-COE',
        department: 'Office of Controller of Examinations',
        role: 'admin'
      }
    }
  : null;

// 20 Questions for Data Structures (Exam ID: 1)
// NOTE: correctAnswer is used only by the mock localStorage scoring layer.
// When a real backend is connected, questions served to students must NEVER
// include correctAnswer. The backend scores submissions server-side.
export const DATA_STRUCTURES_QUESTIONS = [
  {
    id: 101, examId: 1, sectionId: 'sec-1',
    sectionTitle: 'Section A: Linear Data Structures & Foundations',
    questionNumber: 1,
    questionText: 'Which of the following data structures is considered a linear data structure?',
    options: ['Binary Tree', 'Graph', 'Stack', 'Heap'],
    correctAnswer: 2, marks: 1,
    explanation: 'A Stack organizes elements sequentially where each element has unique predecessors and successors.'
  },
  {
    id: 102, examId: 1, sectionId: 'sec-1',
    sectionTitle: 'Section A: Linear Data Structures & Foundations',
    questionNumber: 2,
    questionText: 'In a circular queue implemented using an array of size MAX, what condition indicates that the queue is completely full?',
    options: ['(rear + 1) % MAX == front', 'rear == front', 'rear == MAX - 1', 'front == -1'],
    correctAnswer: 0, marks: 1,
    explanation: 'In a circular array implementation, the queue is full when advancing the rear index by one modulo MAX wraps around to the current front position.'
  },
  {
    id: 103, examId: 1, sectionId: 'sec-1',
    sectionTitle: 'Section A: Linear Data Structures & Foundations',
    questionNumber: 3,
    questionText: 'What is the minimum number of stacks required to implement a FIFO queue efficiently?',
    options: ['1', '2', '3', '4'],
    correctAnswer: 1, marks: 1,
    explanation: 'Two stacks (inbox and outbox) are required to reverse the LIFO order into FIFO order.'
  },
  {
    id: 104, examId: 1, sectionId: 'sec-1',
    sectionTitle: 'Section A: Linear Data Structures & Foundations',
    questionNumber: 4,
    questionText: 'What is the time complexity to insert a node at the beginning of a singly linked list if head pointer is given?',
    options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'],
    correctAnswer: 1, marks: 1,
    explanation: 'Inserting at the head requires adjusting the next pointer of the new node to the current head in constant time O(1).'
  },
  {
    id: 105, examId: 1, sectionId: 'sec-1',
    sectionTitle: 'Section A: Linear Data Structures & Foundations',
    questionNumber: 5,
    questionText: 'Which collision resolution technique stores all colliding keys in a linked list attached to the corresponding bucket?',
    options: ['Linear Probing', 'Quadratic Probing', 'Separate Chaining', 'Double Hashing'],
    correctAnswer: 2, marks: 1,
    explanation: 'Separate Chaining resolves hash collisions by maintaining a linked list of all key-value entries hashing to the same bucket.'
  },
  {
    id: 106, examId: 1, sectionId: 'sec-1',
    sectionTitle: 'Section A: Linear Data Structures & Foundations',
    questionNumber: 6,
    questionText: 'Which notation is used for arithmetic expressions where the operator precedes its operands (Polish notation)?',
    options: ['Infix Notation', 'Postfix Notation', 'Prefix Notation', 'Parenthesized Notation'],
    correctAnswer: 2, marks: 1,
    explanation: 'In Prefix notation (Polish notation), the operator is written before its two operands.'
  },
  {
    id: 107, examId: 1, sectionId: 'sec-1',
    sectionTitle: 'Section A: Linear Data Structures & Foundations',
    questionNumber: 7,
    questionText: 'In a doubly linked list, each node requires pointers to:',
    options: ['Child and Parent', 'Left child and Right child', 'Next node and Previous node', 'First node and Last node'],
    correctAnswer: 2, marks: 1,
    explanation: 'Each node in a doubly linked list contains two reference pointers: one forward to the next node and one backward to the previous node.'
  },
  {
    id: 108, examId: 1, sectionId: 'sec-1',
    sectionTitle: 'Section A: Linear Data Structures & Foundations',
    questionNumber: 8,
    questionText: 'What happens when an attempt is made to pop an item from an empty stack?',
    options: ['Stack Overflow', 'Stack Underflow', 'Segmentation Fault', 'Memory Leak'],
    correctAnswer: 1, marks: 1,
    explanation: 'Attempting to pop from a stack with zero items is a classic Stack Underflow error.'
  },
  {
    id: 109, examId: 1, sectionId: 'sec-1',
    sectionTitle: 'Section A: Linear Data Structures & Foundations',
    questionNumber: 9,
    questionText: 'Which data structure is optimal for verifying matching and balanced pairs of parentheses?',
    options: ['Queue', 'Stack', 'Circular Linked List', 'B-Tree'],
    correctAnswer: 1, marks: 1,
    explanation: 'A Stack is optimal because the most recently opened bracket must be the first one to be closed (LIFO).'
  },
  {
    id: 110, examId: 1, sectionId: 'sec-1',
    sectionTitle: 'Section A: Linear Data Structures & Foundations',
    questionNumber: 10,
    questionText: 'What is the time complexity of searching for an element in an unsorted array of n elements?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 2, marks: 1,
    explanation: 'Linear search traverses each element from index 0 to n-1 in worst-case O(n) time.'
  },
  {
    id: 111, examId: 1, sectionId: 'sec-2',
    sectionTitle: 'Section B: Non-Linear Structures & Tree Algorithms',
    questionNumber: 11,
    questionText: 'What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (AVL Tree) containing n nodes?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correctAnswer: 2, marks: 1,
    explanation: 'In an AVL tree, the height is strictly balanced to O(log n), so worst-case search is O(log n).'
  },
  {
    id: 112, examId: 1, sectionId: 'sec-2',
    sectionTitle: 'Section B: Non-Linear Structures & Tree Algorithms',
    questionNumber: 12,
    questionText: 'Which data structure is primarily used for implementing Breadth-First Search (BFS) in a graph?',
    options: ['Stack', 'Queue', 'Priority Queue', 'Array'],
    correctAnswer: 1, marks: 1,
    explanation: 'BFS explores vertices level by level in FIFO order, naturally supported by a Queue.'
  },
  {
    id: 113, examId: 1, sectionId: 'sec-2',
    sectionTitle: 'Section B: Non-Linear Structures & Tree Algorithms',
    questionNumber: 13,
    questionText: 'Which sorting algorithm has the best average-case time complexity among the following?',
    options: ['Bubble Sort', 'Insertion Sort', 'Selection Sort', 'Merge Sort'],
    correctAnswer: 3, marks: 1,
    explanation: 'Merge Sort guarantees O(n log n) in best, average, and worst cases.'
  },
  {
    id: 114, examId: 1, sectionId: 'sec-2',
    sectionTitle: 'Section B: Non-Linear Structures & Tree Algorithms',
    questionNumber: 14,
    questionText: 'In a max-heap of n elements, where is the second largest element always located?',
    options: ['At the root', 'Either at index 1 or index 2 (children of the root)', 'At any leaf node', 'At the last index (n-1)'],
    correctAnswer: 1, marks: 1,
    explanation: 'The largest is at the root (index 0). The second largest must be one of the direct children (index 1 or 2).'
  },
  {
    id: 115, examId: 1, sectionId: 'sec-2',
    sectionTitle: 'Section B: Non-Linear Structures & Tree Algorithms',
    questionNumber: 15,
    questionText: 'What is the maximum number of nodes possible at depth d of a binary tree (root at depth 0)?',
    options: ['2^d', '2^(d+1)', '2^d - 1', 'd^2'],
    correctAnswer: 0, marks: 1,
    explanation: 'At depth d there can be at most 2^d nodes.'
  },
  {
    id: 116, examId: 1, sectionId: 'sec-2',
    sectionTitle: 'Section B: Non-Linear Structures & Tree Algorithms',
    questionNumber: 16,
    questionText: 'Which traversal of a Binary Search Tree (BST) produces keys in non-decreasing sorted order?',
    options: ['Pre-order traversal', 'In-order traversal', 'Post-order traversal', 'Level-order traversal'],
    correctAnswer: 1, marks: 1,
    explanation: 'In-order traversal (Left, Root, Right) produces keys in ascending order in a BST.'
  },
  {
    id: 117, examId: 1, sectionId: 'sec-2',
    sectionTitle: 'Section B: Non-Linear Structures & Tree Algorithms',
    questionNumber: 17,
    questionText: 'What is the worst-case time complexity of QuickSort when the pivot is always the smallest or largest element?',
    options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'],
    correctAnswer: 2, marks: 1,
    explanation: 'When the partition is always unbalanced, the recursion depth reaches n, yielding O(n^2) comparisons.'
  },
  {
    id: 118, examId: 1, sectionId: 'sec-2',
    sectionTitle: 'Section B: Non-Linear Structures & Tree Algorithms',
    questionNumber: 18,
    questionText: 'Which graph representation is most space-efficient for a sparse graph with V vertices and E edges where E << V^2?',
    options: ['Adjacency Matrix', 'Adjacency List', 'Incidence Matrix', 'Distance Matrix'],
    correctAnswer: 1, marks: 1,
    explanation: 'An Adjacency List requires O(V + E) space vs O(V^2) for an Adjacency Matrix.'
  },
  {
    id: 119, examId: 1, sectionId: 'sec-2',
    sectionTitle: 'Section B: Non-Linear Structures & Tree Algorithms',
    questionNumber: 19,
    questionText: "In Dijkstra's single-source shortest path algorithm, which auxiliary data structure gives the best asymptotic performance?",
    options: ['Simple Array', 'Min-Priority Queue / Fibonacci Heap', 'Stack', 'Binary Search Tree'],
    correctAnswer: 1, marks: 1,
    explanation: 'Using a Fibonacci Heap allows efficient extract-min and decrease-key in O(E + V log V) time.'
  },
  {
    id: 120, examId: 1, sectionId: 'sec-2',
    sectionTitle: 'Section B: Non-Linear Structures & Tree Algorithms',
    questionNumber: 20,
    questionText: 'How many edges are present in a tree with n vertices?',
    options: ['n', 'n - 1', 'n + 1', '2n'],
    correctAnswer: 1, marks: 1,
    explanation: 'Any connected acyclic graph (tree) with n vertices contains exactly n - 1 edges.'
  }
];

export const INITIAL_EXAMS = [
  {
    id: 1, title: 'Data Structures', subject: 'Computer Science & Engineering', code: 'CS301',
    description: 'Comprehensive mid-semester examination divided into two sequential, locked sections.',
    durationMinutes: 60, totalQuestions: 20, totalMarks: 20, passingMarks: 8,
    status: 'Available', scheduledDate: '2026-09-22T10:00:00.000Z',
    isPublished: true, maxAttempts: 1, allowRetake: false,
    sections: [
      { id: 'sec-1', title: 'Section A: Linear Data Structures & Foundations', durationMinutes: 30, totalQuestions: 10, totalMarks: 10, passingMarks: 4, description: 'Arrays, Stacks, Queues, Linked Lists and Hashing.' },
      { id: 'sec-2', title: 'Section B: Non-Linear Structures & Tree Algorithms', durationMinutes: 30, totalQuestions: 10, totalMarks: 10, passingMarks: 4, description: 'Binary Search Trees, AVL Trees, Heaps, and Graph Traversals.' }
    ]
  },
  {
    id: 2, title: 'Database Management Systems', subject: 'Computer Science & IT', code: 'CS304',
    description: 'End-term evaluation on Relational Algebra, SQL queries, Normalization, and ACID transactions.',
    durationMinutes: 45, totalQuestions: 15, totalMarks: 15, passingMarks: 6,
    status: 'Available', scheduledDate: '2026-09-25T14:30:00.000Z',
    isPublished: true, maxAttempts: 1, allowRetake: false,
    sections: [
      { id: 'sec-db-1', title: 'Section A: Relational Model & SQL Calculus', durationMinutes: 25, totalQuestions: 8, totalMarks: 8, passingMarks: 3, description: 'Relational algebra, entity relationships, DDL/DML.' },
      { id: 'sec-db-2', title: 'Section B: Normalization & Transaction Concurrency', durationMinutes: 20, totalQuestions: 7, totalMarks: 7, passingMarks: 3, description: 'Functional dependencies, 3NF/BCNF, Two-phase locking, ACID.' }
    ]
  },
  {
    id: 3, title: 'Operating Systems', subject: 'Computer Science & Engineering', code: 'CS302',
    description: 'Assessment on CPU scheduling, Memory management, Semaphores, and Deadlock detection.',
    durationMinutes: 50, totalQuestions: 15, totalMarks: 15, passingMarks: 6,
    status: 'Available', scheduledDate: '2026-09-28T11:00:00.000Z',
    isPublished: true, maxAttempts: 1, allowRetake: false,
    sections: [
      { id: 'sec-os-1', title: 'Section A: Process Management & CPU Scheduling', durationMinutes: 25, totalQuestions: 8, totalMarks: 8, passingMarks: 3, description: 'Process states, PCB, Context switching, Preemptive scheduling.' },
      { id: 'sec-os-2', title: 'Section B: Virtual Memory & Concurrency Sync', durationMinutes: 25, totalQuestions: 7, totalMarks: 7, passingMarks: 3, description: 'Paging, Segmentation, Mutex locks, Semaphores, Banker algorithm.' }
    ]
  },
  {
    id: 4, title: 'Computer Networks', subject: 'Electronics & Computer Science', code: 'CS401',
    description: 'Standard exam on OSI 7-layer stack, TCP/IP, IP addressing, and routing protocols.',
    durationMinutes: 60, totalQuestions: 20, totalMarks: 20, passingMarks: 8,
    status: 'Upcoming', scheduledDate: '2026-10-02T10:00:00.000Z',
    isPublished: true, maxAttempts: 1, allowRetake: false,
    sections: [
      { id: 'sec-cn-1', title: 'Section A: Physical & Data Link Layer Protocols', durationMinutes: 30, totalQuestions: 10, totalMarks: 10, passingMarks: 4, description: 'Framing, Error detection, Sliding window, CSMA/CD.' },
      { id: 'sec-cn-2', title: 'Section B: Network, Transport & Security Protocols', durationMinutes: 30, totalQuestions: 10, totalMarks: 10, passingMarks: 4, description: 'IP subnetting, Distance vector routing, TCP congestion control, TLS.' }
    ]
  },
  {
    id: 5, title: 'Software Engineering', subject: 'Information Technology', code: 'IT302',
    description: 'Module examination covering Agile Scrum, software lifecycle models, and testing strategies.',
    durationMinutes: 40, totalQuestions: 15, totalMarks: 15, passingMarks: 6,
    status: 'Upcoming', scheduledDate: '2026-10-05T09:30:00.000Z',
    isPublished: false, maxAttempts: 1, allowRetake: false,
    sections: [
      { id: 'sec-se-1', title: 'Section A: Process Models & Agile Principles', durationMinutes: 20, totalQuestions: 8, totalMarks: 8, passingMarks: 3, description: 'Waterfall, Spiral, Scrum sprints, user stories.' },
      { id: 'sec-se-2', title: 'Section B: Software Architecture & QA Testing', durationMinutes: 20, totalQuestions: 7, totalMarks: 7, passingMarks: 3, description: 'Design patterns, Unit testing, Integration testing, CI/CD.' }
    ]
  }
];

export const INITIAL_STUDENTS = [
  { id: 's2', name: 'Student Name 2', email: 'student2@cgu-odisha.ac.in', rollNumber: 'XXX XXXXX02', registrationNumber: '2026CSE00002', department: 'Computer Science & Engineering', program: 'B.Tech', year: '3rd Year', semester: '5th Semester', batch: '2023–2027', status: 'Active', examEligibility: 'Eligible', registeredDate: '2026-08-14', examsTaken: 2, averageScore: '90%' },
  { id: 's3', name: 'Student Name 3', email: 'student3@cgu-odisha.ac.in', rollNumber: 'XXX XXXXX03', registrationNumber: '2026ECE00003', department: 'Electronics & Communication Engineering', program: 'B.Tech', year: '3rd Year', semester: '5th Semester', batch: '2023–2027', status: 'Active', examEligibility: 'Eligible', registeredDate: '2026-08-15', examsTaken: 1, averageScore: '75%' },
  { id: 's4', name: 'Student Name 4', email: 'student4@cgu-odisha.ac.in', rollNumber: 'XXX XXXXX04', registrationNumber: '2026IT00004', department: 'Information Technology', program: 'B.Tech', year: '3rd Year', semester: '5th Semester', batch: '2023–2027', status: 'Active', examEligibility: 'Eligible', registeredDate: '2026-08-18', examsTaken: 3, averageScore: '85%' },
  { id: 's5', name: 'Student Name 5', email: 'student5@cgu-odisha.ac.in', rollNumber: 'XXX XXXXX05', registrationNumber: '2026DS00005', department: 'Data Science', program: 'B.Tech', year: '2nd Year', semester: '3rd Semester', batch: '2024–2028', status: 'Active', examEligibility: 'Eligible', registeredDate: '2026-08-20', examsTaken: 1, averageScore: '65%' }
];

export const INITIAL_RESULTS = [
  {
    id: 'res-1001', studentId: 's1', studentName: 'Student Name', studentEmail: 'student@cgu-odisha.ac.in',
    rollNumber: 'XXX XXXXXXX', department: 'Computer Science & Engineering',
    examId: 2, examTitle: 'Database Management Systems', examCode: 'CS304',
    attemptNumber: 1, isRetest: false, totalQuestions: 15, attempted: 15, correct: 13, wrong: 2, unattempted: 0,
    score: 13, totalMarks: 15, percentage: 86.67, status: 'PASS',
    submittedAt: '2026-09-18T15:20:00.000Z', violations: 0, autoSubmitted: false,
    sectionScores: {
      'sec-db-1': { name: 'Section A: Relational Model', score: 7, totalMarks: 8 },
      'sec-db-2': { name: 'Section B: Normalization & Concurrency', score: 6, totalMarks: 7 }
    }
  },
  {
    id: 'res-1002', studentId: 's1', studentName: 'Student Name', studentEmail: 'student@cgu-odisha.ac.in',
    rollNumber: 'XXX XXXXXXX', department: 'Computer Science & Engineering',
    examId: 3, examTitle: 'Operating Systems', examCode: 'CS302',
    attemptNumber: 1, isRetest: false, totalQuestions: 15, attempted: 14, correct: 11, wrong: 3, unattempted: 1,
    score: 11, totalMarks: 15, percentage: 73.33, status: 'PASS',
    submittedAt: '2026-09-12T11:45:00.000Z', violations: 1, autoSubmitted: false,
    sectionScores: {
      'sec-os-1': { name: 'Section A: Process Management', score: 6, totalMarks: 8 },
      'sec-os-2': { name: 'Section B: Virtual Memory', score: 5, totalMarks: 7 }
    }
  },
  {
    id: 'res-1003', studentId: 's2', studentName: 'Student Name 2', studentEmail: 'student2@cgu-odisha.ac.in',
    rollNumber: 'XXX XXXXX02', department: 'Computer Science & Engineering',
    examId: 1, examTitle: 'Data Structures', examCode: 'CS301',
    attemptNumber: 1, isRetest: false, totalQuestions: 20, attempted: 20, correct: 18, wrong: 2, unattempted: 0,
    score: 18, totalMarks: 20, percentage: 90.0, status: 'PASS',
    submittedAt: '2026-09-20T11:15:00.000Z', violations: 0, autoSubmitted: false,
    sectionScores: {
      'sec-1': { name: 'Section A: Linear Structures', score: 9, totalMarks: 10 },
      'sec-2': { name: 'Section B: Non-Linear Structures', score: 9, totalMarks: 10 }
    }
  }
];

export const INITIAL_RETESTS = [
  {
    id: 'ret-2001', examId: 1, examTitle: 'Data Structures', examCode: 'CS301',
    studentId: 's1', studentName: 'Student Name', studentEmail: 'student@cgu-odisha.ac.in',
    rollNumber: 'XXX XXXXXXX', department: 'Computer Science & Engineering',
    reason: 'Campus lab power supply cut off during Section A question 7',
    status: 'Approved', attemptAllowed: 2,
    scheduledWindow: '2026-09-23T09:00:00.000Z to 2026-09-25T18:00:00.000Z',
    approvedBy: 'Office of the Controller of Examinations',
    refCode: 'COE/CVRGU/RET-2026/041', createdAt: '2026-09-22T08:30:00.000Z',
    remarks: 'Verified terminal workstation outage log. Retest authorized for Attempt 2.'
  },
  {
    id: 'ret-2002', examId: 3, examTitle: 'Operating Systems', examCode: 'CS302',
    studentId: 's3', studentName: 'Student Name 3', studentEmail: 'student3@cgu-odisha.ac.in',
    rollNumber: 'XXX XXXXX03', department: 'Electronics & Communication Engineering',
    reason: 'Browser frozen due to workstation graphics driver crash',
    status: 'Pending', attemptAllowed: 2,
    scheduledWindow: 'Pending COE Scheduling', approvedBy: 'Pending COE Review',
    refCode: 'COE/CVRGU/RET-2026/042', createdAt: '2026-09-22T10:15:00.000Z',
    remarks: 'Department recommendation attached for consideration.'
  }
];

export const EXAM_RULES = [
  'Examinations are structured into sequential sections with independent countdown timers.',
  'Sequential Section Access: Candidates must finish Section A before accessing Section B.',
  'Irreversible Section Locking: Once a section is submitted or its timer reaches zero, it is permanently locked and cannot be revisited.',
  'Each question carries 1 mark. There is no negative marking for incorrect answers.',
  'Do not refresh or minimize the browser window during the active section.',
  'Maintain an active and uninterrupted internet connection.',
  'Tab switching or leaving fullscreen triggers a proctoring security violation strike.',
  'The system permits a maximum of 2 warnings. The 3rd security violation triggers automatic examination submission.',
  'Retests are strictly authority-controlled by the Controller of Examinations and cannot be self-activated by students.',
  'Ensure you have verified all attempted answers in the active section prior to locking it.'
];
