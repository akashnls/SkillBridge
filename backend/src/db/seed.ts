import { v4 as uuidv4 } from 'uuid';
import { SkillTaxonomy } from '../models/SkillTaxonomy.js';
import { Assessment } from '../models/Assessment.js';
import { PlatformSetting } from '../models/PlatformSetting.js';
import { BadgeTemplate } from '../models/BadgeTemplate.js';

export async function seedDatabase() {
  const existingSkills = await SkillTaxonomy.countDocuments();
  if (existingSkills > 0) {
    console.log('Database already contains records. Skipping seed.');
    return;
  }

  console.log('🌱 Seeding database with taxonomy and assessments...');

  // 1. Skills Taxonomy
  const skillsData = [
    { name: 'React', category: 'Frontend', desc: 'Component-based UI development with hooks and state management', syn: ['React.js', 'ReactJS'], diff: 'Intermediate' },
    { name: 'Node.js', category: 'Backend', desc: 'Asynchronous event-driven JavaScript runtime for server applications', syn: ['NodeJS', 'Express.js'], diff: 'Intermediate' },
    { name: 'JavaScript', category: 'Frontend', desc: 'Core ECMAScript language for frontend and backend web development', syn: ['JS', 'ES6+'], diff: 'Beginner' },
    { name: 'TypeScript', category: 'Frontend', desc: 'Typed superset of JavaScript providing static type definitions', syn: ['TS'], diff: 'Intermediate' },
    { name: 'Python', category: 'Backend', desc: 'Versatile high-level programming language for backend, AI, and scripts', syn: ['Python 3', 'Py'], diff: 'Beginner' },
    { name: 'SQL', category: 'Data Science', desc: 'Structured Query Language for managing relational databases', syn: ['PostgreSQL', 'MySQL', 'Relational DB'], diff: 'Beginner' },
    { name: 'Data Analysis', category: 'Data Science', desc: 'Extracting actionable insights from structured data sets', syn: ['Data Analytics', 'BI'], diff: 'Intermediate' },
    { name: 'Pandas', category: 'Data Science', desc: 'Data manipulation and analysis library for Python', syn: ['NumPy/Pandas'], diff: 'Intermediate' },
    { name: 'Tailwind CSS', category: 'Frontend', desc: 'Utility-first CSS framework for rapid UI design', syn: ['Tailwind'], diff: 'Beginner' },
    { name: 'Docker', category: 'DevOps', desc: 'Containerization platform for packaging and running applications', syn: ['Containers'], diff: 'Intermediate' },
    { name: 'Git', category: 'DevOps', desc: 'Distributed version control system for tracking code changes', syn: ['GitHub', 'GitLab'], diff: 'Beginner' },
    { name: 'REST APIs', category: 'Backend', desc: 'Architectural pattern for stateless networked client-server APIs', syn: ['RESTful API', 'HTTP API'], diff: 'Intermediate' },
    { name: 'Machine Learning', category: 'AI/ML', desc: 'Algorithms that build mathematical models based on sample training data', syn: ['ML', 'Scikit-Learn'], diff: 'Advanced' },
    { name: 'FastAPI', category: 'Backend', desc: 'Modern high-performance Python web framework for building APIs', syn: ['FastAPI Python'], diff: 'Intermediate' },
    { name: 'UI/UX Design', category: 'Design', desc: 'User experience research, wireframing, and interactive design', syn: ['Figma', 'User Interface'], diff: 'Beginner' },
    { name: 'System Design', category: 'Backend', desc: 'Designing scalable architectures, caching, load balancers, and schemas', syn: ['Distributed Systems'], diff: 'Advanced' },
    { name: 'Cloud Computing (AWS/GCP)', category: 'DevOps', desc: 'Deploying and scaling applications on modern cloud infrastructure', syn: ['AWS', 'GCP', 'Azure'], diff: 'Intermediate' },
    { name: 'Communication & Teamwork', category: 'Soft Skills', desc: 'Clear technical articulation, active listening, and collaboration', syn: ['Soft Skills', 'Collaboration'], diff: 'Beginner' }
  ];

  for (const s of skillsData) {
    await SkillTaxonomy.findOneAndUpdate(
      { name: s.name },
      { $setOnInsert: { id: `sk-${uuidv4()}`, name: s.name, category: s.category, description: s.desc, synonyms: s.syn, aliases: [], difficulty_level: s.diff, is_active: true } },
      { upsert: true, new: true }
    );
  }

  // 2. Assessments
  const assessmentsData = [
    {
      id: 'asm-react', skill_name: 'React', title: 'React & Modern Component Architecture Assessment',
      category: 'Frontend', duration_minutes: 15, pass_percentage: 70,
      questions: [
        { id: 'q1', question: 'Which React Hook is primarily used for performing side effects such as data fetching or subscriptions?', options: ['useMemo', 'useEffect', 'useState', 'useRef'], correct_index: 1, explanation: 'useEffect allows running side effects after components render or state dependencies update.' },
        { id: 'q2', question: "What is the key benefit of React's Virtual DOM?", options: ['It replaces HTML completely in browser rendering engine', 'It minimizes direct browser DOM re-paints by calculating minimal batch diffs', 'It connects directly to backend SQL databases', 'It compiles TypeScript code faster'], correct_index: 1, explanation: 'The Virtual DOM computes minimal diffs (reconciliation) before applying targeted updates to the real DOM.' },
        { id: 'q3', question: 'How should you properly pass state from a parent component down to child components?', options: ['Through global window variables', 'Via Props or React Context', 'Using localStorage directly', 'By modifying child internal state directly'], correct_index: 1, explanation: 'Props provide unidirectional data flow from parent to child, while Context provides shared state across a tree.' },
        { id: 'q4', question: 'When should you use the `useCallback` hook in React?', options: ['To memoize a callback function instance between renders to prevent unnecessary child re-renders', 'To fetch HTTP APIs synchronously', 'To replace regular CSS stylesheets', 'To store persistent user credentials'], correct_index: 0, explanation: 'useCallback returns a memoized version of a callback that only changes if specified dependencies change.' },
        { id: 'q5', question: 'What is the purpose of the `key` prop in React lists?', options: ['It encrypts item data', 'It helps React identify which items have changed, been added, or removed for efficient rendering', 'It determines CSS font size', 'It is required for backend API calls'], correct_index: 1, explanation: 'Keys give elements a stable identity across renders so React can efficiently reorder or update list nodes.' }
      ]
    },
    {
      id: 'asm-python', skill_name: 'Python', title: 'Python Core Programming & Data Structures',
      category: 'Backend', duration_minutes: 15, pass_percentage: 70,
      questions: [
        { id: 'q1', question: 'Which Python built-in data type is mutable and maintains insertion order (Python 3.7+)?', options: ['Tuple', 'Dictionary', 'FrozenSet', 'String'], correct_index: 1, explanation: 'Python dictionaries are mutable key-value structures that preserve insertion order.' },
        { id: 'q2', question: 'What is the time complexity of looking up a key in an average Python dictionary?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'], correct_index: 2, explanation: 'Dictionaries use hash tables under the hood, yielding O(1) average lookup time.' },
        { id: 'q3', question: 'What does the `yield` keyword do in a Python function?', options: ['It terminates the program immediately', 'It turns the function into a generator that produces values lazily on demand', 'It imports an external library', 'It creates a multi-threaded process'], correct_index: 1, explanation: "yield produces values on demand while preserving the function's local execution state (lazy generator)." },
        { id: 'q4', question: 'How do you handle exceptions properly in Python?', options: ['try / except / finally blocks', 'if / else error flags', 'catch / throw syntax', 'goto error statement'], correct_index: 0, explanation: 'Python uses try-except blocks with optional else and finally clauses for structured exception handling.' },
        { id: 'q5', question: 'What is a Python decorator?', options: ['A CSS styling tag in Python', 'A function that takes another function as an argument and extends its behavior without modifying it directly', 'A tool for converting Python into C++', 'A database index generator'], correct_index: 1, explanation: 'Decorators are higher-order functions that wrap another function or method to extend functionality.' }
      ]
    },
    {
      id: 'asm-sql', skill_name: 'SQL', title: 'SQL Relational Queries & Database Indexing',
      category: 'Data Science', duration_minutes: 15, pass_percentage: 70,
      questions: [
        { id: 'q1', question: 'What is the difference between `WHERE` and `HAVING` in SQL?', options: ['WHERE filters rows before aggregation; HAVING filters groups after GROUP BY aggregation', 'WHERE is only used for strings; HAVING is only used for numbers', 'There is no difference, they are interchangeable synonyms', 'HAVING creates new tables, WHERE deletes them'], correct_index: 0, explanation: 'WHERE filters individual records before grouping, while HAVING filters aggregated group results.' },
        { id: 'q2', question: 'Which SQL JOIN returns all records from the left table and matched records from the right table?', options: ['INNER JOIN', 'LEFT (OUTER) JOIN', 'CROSS JOIN', 'FULL OUTER JOIN'], correct_index: 1, explanation: 'LEFT JOIN returns all rows from the left table and matching rows from the right table (or NULL if no match).' },
        { id: 'q3', question: 'What does creating a B-Tree index on a column accomplish?', options: ['It speeds up search and filtering queries at the cost of additional disk space and slight insert/update overhead', 'It deletes duplicate data automatically', 'It enforces password encryption on the table', 'It converts SQLite into NoSQL'], correct_index: 0, explanation: 'Indexes create sorted lookup structures that accelerate SELECT WHERE and JOIN lookups.' },
        { id: 'q4', question: 'What property does ACID transaction isolation guarantee?', options: ['Atomicity, Consistency, Isolation, and Durability', 'Asynchronous Caching and Inverted Data', 'Automatic Cloud Index Deployment', 'Accelerated Compute Interface Design'], correct_index: 0, explanation: 'ACID guarantees database reliability through Atomicity, Consistency, Isolation, and Durability.' },
        { id: 'q5', question: 'What is normalization in relational database design?', options: ['Structuring tables to reduce data redundancy and improve data integrity', 'Converting text columns to uppercase', 'Backing up database files every hour', 'Translating SQL queries into JavaScript'], correct_index: 0, explanation: 'Normalization organizes schema tables according to normal forms (1NF, 2NF, 3NF) to eliminate redundant anomalies.' }
      ]
    },
    {
      id: 'asm-node', skill_name: 'Node.js', title: 'Node.js & Asynchronous API Development',
      category: 'Backend', duration_minutes: 15, pass_percentage: 70,
      questions: [
        { id: 'q1', question: 'How does Node.js handle high concurrent I/O operations despite being single-threaded?', options: ['Using a non-blocking Event Loop powered by libuv', 'By spinning up 100 OS threads for every HTTP request', 'By compiling JavaScript directly to assembly', 'Through synchronous file reading loops'], correct_index: 0, explanation: 'The libuv event loop and asynchronous worker threadpool handle non-blocking asynchronous I/O.' },
        { id: 'q2', question: 'What is the role of Express.js middleware?', options: ['Functions that have access to the request object, response object, and next middleware function in the request-response cycle', 'Hardware routers that connect servers to the internet', 'Database table schemas', 'Client-side CSS animations'], correct_index: 0, explanation: 'Middleware functions execute sequential logic (authentication, parsing, logging) before sending a response.' },
        { id: 'q3', question: 'Why should you avoid synchronous methods like `fs.readFileSync` in production Express servers?', options: ['Because they block the single main event thread, freezing all other incoming user requests until completed', 'Because they delete the file after reading', 'Because Node.js does not allow reading files', 'Because they return promises'], correct_index: 0, explanation: 'Synchronous operations block the Node event loop, causing severe latency spikes for all concurrent clients.' }
      ]
    }
  ];

  for (const a of assessmentsData) {
    await Assessment.findOneAndUpdate(
      { id: a.id },
      { $setOnInsert: a },
      { upsert: true }
    );
  }

  // 3. Platform Settings
  const defaultSettings = [
    { key: 'job_approval_required', value: '0' },
    { key: 'company_verification_required', value: '1' },
    { key: 'feature_messaging', value: '1' },
    { key: 'feature_interviews', value: '1' },
    { key: 'default_language', value: 'en' },
  ];
  for (const s of defaultSettings) {
    await PlatformSetting.findOneAndUpdate({ key: s.key }, { $setOnInsert: s }, { upsert: true });
  }

  // 4. Badge Templates
  const defaultTemplates = [
    { id: 'bt-python', name: 'Python Practitioner', skill_name: 'Python', level: 'Intermediate', description: 'Verified Python assessment badge', criteria: 'Score >= passing threshold', icon: '🐍' },
    { id: 'bt-react', name: 'React Developer', skill_name: 'React', level: 'Intermediate', description: 'Verified React assessment badge', criteria: 'Score >= passing threshold', icon: '⚛️' },
    { id: 'bt-sql', name: 'SQL Analyst', skill_name: 'SQL', level: 'Intermediate', description: 'Verified SQL assessment badge', criteria: 'Score >= passing threshold', icon: '🗃️' },
  ];
  for (const t of defaultTemplates) {
    await BadgeTemplate.findOneAndUpdate({ id: t.id }, { $setOnInsert: { ...t, is_active: true } }, { upsert: true });
  }

  console.log('✅ Database seeded successfully with taxonomy, assessments, settings, and badge templates!');
}

// Auto-run if executed directly as a standalone script
const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js')
);

if (isDirectExecution) {
  (async () => {
    try {
      const { connectMongoDB } = await import('./mongoose.js');
      const mongoose = (await import('mongoose')).default;
      await connectMongoDB();
      await seedDatabase();
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('Seed execution error:', err);
      process.exit(1);
    }
  })();
}
