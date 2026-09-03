import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { db, initDatabase } from './database.js';

export function seedDatabase() {
  initDatabase();

  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (userCount > 0) {
    console.log('Database already contains records. Skipping seed.');
    return;
  }

  console.log('🌱 Seeding database with realistic initial data...');

  const salt = bcrypt.genSaltSync(10);
  const userPasswordHash = bcrypt.hashSync('password123', salt);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);

  const now = new Date().toISOString();

  // 1. Users
  const user1Id = 'u-candidate-arjun';
  const user2Id = 'u-candidate-priya';
  const user3Id = 'u-candidate-kiran';
  const employer1Id = 'u-employer-techcorp';
  const employer2Id = 'u-employer-innovate';
  const adminId = 'u-admin-system';

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, avatar_url, biometric_enabled, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(user1Id, 'Arjun Sharma', 'arjun@example.com', userPasswordHash, 'job_seeker', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 1, now);
  insertUser.run(user2Id, 'Priya Patel', 'priya@example.com', userPasswordHash, 'job_seeker', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 0, now);
  insertUser.run(user3Id, 'Kiran Kumar', 'kiran@example.com', userPasswordHash, 'job_seeker', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 0, now);
  insertUser.run(employer1Id, 'Sarah Jenkins (TechCorp)', 'recruiter@techcorp.io', userPasswordHash, 'employer', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 0, now);
  insertUser.run(employer2Id, 'Vikram Malhotra (InnovateAI)', 'talent@innovate.ai', userPasswordHash, 'employer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 0, now);
  insertUser.run(adminId, 'Platform Administrator', 'admin@skillbridge.org', adminPasswordHash, 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 0, now);

  // 2. Candidate Profiles
  const insertProfile = db.prepare(`
    INSERT INTO profiles (user_id, headline, bio, location, skills, experience_years, education, preferred_language, github_url, linkedin_url, portfolio_website)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProfile.run(
    user1Id,
    'Self-Taught Full-Stack Developer & Open-Source Contributor',
    'Passionate full stack builder who transitioned into software engineering through self-study, open-source work, and building production-ready projects. Skilled in React, Node.js, Python, and SQL.',
    'Indore, Madhya Pradesh, India',
    JSON.stringify(['React', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'Tailwind CSS', 'SQL', 'Git']),
    1.5,
    'B.Sc Computer Science (Tier-2 College)',
    'hi',
    'https://github.com/arjun-sharma-dev',
    'https://linkedin.com/in/arjun-sharma-dev',
    'https://arjunsharma.dev'
  );

  insertProfile.run(
    user2Id,
    'Data Analyst & Business Intelligence Specialist',
    'Certified data analyst with strong expertise in SQL querying, Python analytics (Pandas/NumPy), statistical modeling, and interactive dashboard creation.',
    'Bengaluru, Karnataka, India',
    JSON.stringify(['Python', 'SQL', 'Data Analysis', 'Pandas', 'PowerBI', 'Statistics', 'PostgreSQL']),
    2.0,
    'B.Tech Information Technology',
    'en',
    'https://github.com/priyapatel-data',
    'https://linkedin.com/in/priyapatel-data',
    'https://priyapatel.me'
  );

  insertProfile.run(
    user3Id,
    'Junior Frontend Developer & UI Enthusiast',
    'Recent graduate eager to build accessible, high-performance web applications using modern React and TypeScript.',
    'Hubballi, Karnataka, India',
    JSON.stringify(['HTML/CSS', 'JavaScript', 'React', 'Tailwind CSS', 'Git']),
    0.5,
    'Diploma in Computer Applications',
    'kn',
    'https://github.com/kirankumar-web',
    'https://linkedin.com/in/kirankumar-web',
    ''
  );

  // 3. Companies
  const insertCompany = db.prepare(`
    INSERT INTO companies (id, user_id, name, industry, website, description, location, logo_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCompany.run(
    'comp-techcorp',
    employer1Id,
    'TechCorp Solutions',
    'Software & Cloud Services',
    'https://techcorp.example.com',
    'Building modern cloud applications and distributed digital platforms for global enterprises.',
    'Bengaluru / Remote',
    'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80'
  );

  insertCompany.run(
    'comp-innovate',
    employer2Id,
    'InnovateAI Labs',
    'Artificial Intelligence & DeepTech',
    'https://innovateai.example.com',
    'Pioneering next-generation applied AI tools, agentic workflows, and machine learning infrastructure.',
    'Hyderabad / Hybrid',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'
  );

  // 4. Skills Taxonomy
  const insertSkill = db.prepare(`
    INSERT INTO skills_taxonomy (id, name, category, description, synonyms, difficulty_level)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

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

  skillsData.forEach(s => {
    insertSkill.run(uuidv4(), s.name, s.category, s.desc, JSON.stringify(s.syn), s.diff);
  });

  // 5. Jobs Postings
  const insertJob = db.prepare(`
    INSERT INTO jobs (id, employer_id, company_name, title, description, location, job_type, experience_level, salary_range, required_skills, preferred_skills, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const job1Id = 'job-fullstack-dev';
  insertJob.run(
    job1Id,
    employer1Id,
    'TechCorp Solutions',
    'Full Stack Web Developer (Node.js & React)',
    `We are looking for a capable and proactive Full Stack Web Developer. You will build user-facing web apps, design clean RESTful APIs, and collaborate on database schema optimizations. Non-traditional learners with verified project portfolios and strong problem-solving skills are warmly encouraged to apply!`,
    'Bengaluru / Remote',
    'Full-time',
    'Junior / 1-2 Years',
    '₹6,50,000 - ₹9,50,000 / year',
    JSON.stringify([
      { skill: 'React', weight: 1.0 },
      { skill: 'Node.js', weight: 1.0 },
      { skill: 'JavaScript', weight: 0.9 },
      { skill: 'SQL', weight: 0.8 }
    ]),
    JSON.stringify(['TypeScript', 'Tailwind CSS', 'Docker', 'Git']),
    'open',
    now
  );

  const job2Id = 'job-data-analyst';
  insertJob.run(
    job2Id,
    employer1Id,
    'TechCorp Solutions',
    'Junior Data Analyst',
    `Join our business analytics team to transform messy operational data into clean, visual dashboards. Candidates should demonstrate hands-on SQL query proficiency, Python data wrangling (Pandas), and practical curiosity over formal pedigree.`,
    'Remote',
    'Full-time',
    'Entry-Level / 0-2 Years',
    '₹5,00,000 - ₹8,00,000 / year',
    JSON.stringify([
      { skill: 'SQL', weight: 1.0 },
      { skill: 'Python', weight: 0.9 },
      { skill: 'Data Analysis', weight: 0.9 },
      { skill: 'Pandas', weight: 0.8 }
    ]),
    JSON.stringify(['Git', 'Communication & Teamwork']),
    'open',
    now
  );

  const job3Id = 'job-ai-frontend';
  insertJob.run(
    job3Id,
    employer2Id,
    'InnovateAI Labs',
    'Frontend Engineer - AI Interfaces',
    `InnovateAI is seeking a Frontend Engineer passionate about crafting intuitive conversational and generative AI user interfaces. You will work closely with AI researchers to translate complex model parameters into fluid React applications.`,
    'Hyderabad / Hybrid',
    'Full-time',
    'Mid-Level / 2+ Years',
    '₹8,00,000 - ₹12,00,000 / year',
    JSON.stringify([
      { skill: 'React', weight: 1.0 },
      { skill: 'TypeScript', weight: 0.9 },
      { skill: 'Tailwind CSS', weight: 0.8 },
      { skill: 'REST APIs', weight: 0.8 }
    ]),
    JSON.stringify(['Python', 'Docker', 'UI/UX Design']),
    'open',
    now
  );

  const job4Id = 'job-backend-python';
  insertJob.run(
    job4Id,
    employer2Id,
    'InnovateAI Labs',
    'Backend Engineer (Python & APIs)',
    `Build scalable, asynchronous microservices and API gateways for AI model serving. We care about clean code, robust database schemas, and demonstrated backend competencies.`,
    'Bengaluru / Remote',
    'Contract / Full-time',
    'Junior / 1-3 Years',
    '₹7,00,000 - ₹11,00,000 / year',
    JSON.stringify([
      { skill: 'Python', weight: 1.0 },
      { skill: 'REST APIs', weight: 0.9 },
      { skill: 'SQL', weight: 0.8 }
    ]),
    JSON.stringify(['FastAPI', 'Docker', 'Git']),
    'open',
    now
  );

  // 6. Assessments
  const insertAssessment = db.prepare(`
    INSERT INTO assessments (id, skill_name, title, category, duration_minutes, pass_percentage, questions)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const asmReactId = 'asm-react';
  insertAssessment.run(
    asmReactId,
    'React',
    'React & Modern Component Architecture Assessment',
    'Frontend',
    15,
    70,
    JSON.stringify([
      {
        id: 'q1',
        question: 'Which React Hook is primarily used for performing side effects such as data fetching or subscriptions?',
        options: ['useMemo', 'useEffect', 'useState', 'useRef'],
        correct_index: 1,
        explanation: 'useEffect allows running side effects after components render or state dependencies update.'
      },
      {
        id: 'q2',
        question: 'What is the key benefit of React’s Virtual DOM?',
        options: [
          'It replaces HTML completely in browser rendering engine',
          'It minimizes direct browser DOM re-paints by calculating minimal batch diffs',
          'It connects directly to backend SQL databases',
          'It compiles TypeScript code faster'
        ],
        correct_index: 1,
        explanation: 'The Virtual DOM computes minimal diffs (reconciliation) before applying targeted updates to the real DOM.'
      },
      {
        id: 'q3',
        question: 'How should you properly pass state from a parent component down to child components?',
        options: ['Through global window variables', 'Via Props or React Context', 'Using localStorage directly', 'By modifying child internal state directly'],
        correct_index: 1,
        explanation: 'Props provide unidirectional data flow from parent to child, while Context provides shared state across a tree.'
      },
      {
        id: 'q4',
        question: 'When should you use the `useCallback` hook in React?',
        options: [
          'To memoize a callback function instance between renders to prevent unnecessary child re-renders',
          'To fetch HTTP APIs synchronously',
          'To replace regular CSS stylesheets',
          'To store persistent user credentials'
        ],
        correct_index: 0,
        explanation: 'useCallback returns a memoized version of a callback that only changes if specified dependencies change.'
      },
      {
        id: 'q5',
        question: 'What is the purpose of the `key` prop in React lists?',
        options: [
          'It encrypts item data',
          'It helps React identify which items have changed, been added, or removed for efficient rendering',
          'It determines CSS font size',
          'It is required for backend API calls'
        ],
        correct_index: 1,
        explanation: 'Keys give elements a stable identity across renders so React can efficiently reorder or update list nodes.'
      }
    ])
  );

  const asmPythonId = 'asm-python';
  insertAssessment.run(
    asmPythonId,
    'Python',
    'Python Core Programming & Data Structures',
    'Backend',
    15,
    70,
    JSON.stringify([
      {
        id: 'q1',
        question: 'Which Python built-in data type is mutable and maintains insertion order (Python 3.7+)?',
        options: ['Tuple', 'Dictionary', 'FrozenSet', 'String'],
        correct_index: 1,
        explanation: 'Python dictionaries are mutable key-value structures that preserve insertion order.'
      },
      {
        id: 'q2',
        question: 'What is the time complexity of looking up a key in an average Python dictionary?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
        correct_index: 2,
        explanation: 'Dictionaries use hash tables under the hood, yielding O(1) average lookup time.'
      },
      {
        id: 'q3',
        question: 'What does the `yield` keyword do in a Python function?',
        options: [
          'It terminates the program immediately',
          'It turns the function into a generator that produces values lazily on demand',
          'It imports an external library',
          'It creates a multi-threaded process'
        ],
        correct_index: 1,
        explanation: 'yield produces values on demand while preserving the function’s local execution state (lazy generator).'
      },
      {
        id: 'q4',
        question: 'How do you handle exceptions properly in Python?',
        options: ['try / except / finally blocks', 'if / else error flags', 'catch / throw syntax', 'goto error statement'],
        correct_index: 0,
        explanation: 'Python uses try-except blocks with optional else and finally clauses for structured exception handling.'
      },
      {
        id: 'q5',
        question: 'What is a Python decorator?',
        options: [
          'A CSS styling tag in Python',
          'A function that takes another function as an argument and extends its behavior without modifying it directly',
          'A tool for converting Python into C++',
          'A database index generator'
        ],
        correct_index: 1,
        explanation: 'Decorators are higher-order functions that wrap another function or method to extend functionality.'
      }
    ])
  );

  const asmSqlId = 'asm-sql';
  insertAssessment.run(
    asmSqlId,
    'SQL',
    'SQL Relational Queries & Database Indexing',
    'Data Science',
    15,
    70,
    JSON.stringify([
      {
        id: 'q1',
        question: 'What is the difference between `WHERE` and `HAVING` in SQL?',
        options: [
          'WHERE filters rows before aggregation; HAVING filters groups after GROUP BY aggregation',
          'WHERE is only used for strings; HAVING is only used for numbers',
          'There is no difference, they are interchangeable synonyms',
          'HAVING creates new tables, WHERE deletes them'
        ],
        correct_index: 0,
        explanation: 'WHERE filters individual records before grouping, while HAVING filters aggregated group results.'
      },
      {
        id: 'q2',
        question: 'Which SQL JOIN returns all records from the left table and matched records from the right table?',
        options: ['INNER JOIN', 'LEFT (OUTER) JOIN', 'CROSS JOIN', 'FULL OUTER JOIN'],
        correct_index: 1,
        explanation: 'LEFT JOIN returns all rows from the left table and matching rows from the right table (or NULL if no match).'
      },
      {
        id: 'q3',
        question: 'What does creating a B-Tree index on a column accomplish?',
        options: [
          'It speeds up search and filtering queries at the cost of additional disk space and slight insert/update overhead',
          'It deletes duplicate data automatically',
          'It enforces password encryption on the table',
          'It converts SQLite into NoSQL'
        ],
        correct_index: 0,
        explanation: 'Indexes create sorted lookup structures that accelerate SELECT WHERE and JOIN lookups.'
      },
      {
        id: 'q4',
        question: 'What property does ACID transaction isolation guarantee?',
        options: [
          'Atomicity, Consistency, Isolation, and Durability',
          'Asynchronous Caching and Inverted Data',
          'Automatic Cloud Index Deployment',
          'Accelerated Compute Interface Design'
        ],
        correct_index: 0,
        explanation: 'ACID guarantees database reliability through Atomicity, Consistency, Isolation, and Durability.'
      },
      {
        id: 'q5',
        question: 'What is normalization in relational database design?',
        options: [
          'Structuring tables to reduce data redundancy and improve data integrity',
          'Converting text columns to uppercase',
          'Backing up database files every hour',
          'Translating SQL queries into JavaScript'
        ],
        correct_index: 0,
        explanation: 'Normalization organizes schema tables according to normal forms (1NF, 2NF, 3NF) to eliminate redundant anomalies.'
      }
    ])
  );

  const asmNodeId = 'asm-node';
  insertAssessment.run(
    asmNodeId,
    'Node.js',
    'Node.js & Asynchronous API Development',
    'Backend',
    15,
    70,
    JSON.stringify([
      {
        id: 'q1',
        question: 'How does Node.js handle high concurrent I/O operations despite being single-threaded?',
        options: [
          'Using a non-blocking Event Loop powered by libuv',
          'By spinning up 100 OS threads for every HTTP request',
          'By compiling JavaScript directly to assembly',
          'Through synchronous file reading loops'
        ],
        correct_index: 0,
        explanation: 'The libuv event loop and asynchronous worker threadpool handle non-blocking asynchronous I/O.'
      },
      {
        id: 'q2',
        question: 'What is the role of Express.js middleware?',
        options: [
          'Functions that have access to the request object, response object, and next middleware function in the request-response cycle',
          'Hardware routers that connect servers to the internet',
          'Database table schemas',
          'Client-side CSS animations'
        ],
        correct_index: 0,
        explanation: 'Middleware functions execute sequential logic (authentication, parsing, logging) before sending a response.'
      },
      {
        id: 'q3',
        question: 'Why should you avoid synchronous methods like `fs.readFileSync` in production Express servers?',
        options: [
          'Because they block the single main event thread, freezing all other incoming user requests until completed',
          'Because they delete the file after reading',
          'Because Node.js does not allow reading files',
          'Because they return promises'
        ],
        correct_index: 0,
        explanation: 'Synchronous operations block the Node event loop, causing severe latency spikes for all concurrent clients.'
      }
    ])
  );

  // 7. Verifiable Badges (Pre-issued to showcase verifiable credentials)
  const insertBadge = db.prepare(`
    INSERT INTO badges (id, badge_code, user_id, skill_name, assessment_id, score_percentage, level, issued_at, verification_hash, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const generateBadgeHash = (badgeCode: string, userId: string, skill: string, score: number, issuedAt: string) => {
    return crypto.createHmac('sha256', 'SKILLBRIDGE_SECRET_KEY').update(`${badgeCode}:${userId}:${skill}:${score}:${issuedAt}`).digest('hex');
  };

  const badge1Code = 'SKB-REACT-8921';
  const badge1IssuedAt = new Date(Date.now() - 7 * 86400000).toISOString();
  insertBadge.run(
    'badge-arjun-react',
    badge1Code,
    user1Id,
    'React',
    asmReactId,
    92.0,
    'Advanced',
    badge1IssuedAt,
    generateBadgeHash(badge1Code, user1Id, 'React', 92.0, badge1IssuedAt),
    'active'
  );

  const badge2Code = 'SKB-PYTH-4472';
  const badge2IssuedAt = new Date(Date.now() - 5 * 86400000).toISOString();
  insertBadge.run(
    'badge-arjun-python',
    badge2Code,
    user1Id,
    'Python',
    asmPythonId,
    88.0,
    'Intermediate',
    badge2IssuedAt,
    generateBadgeHash(badge2Code, user1Id, 'Python', 88.0, badge2IssuedAt),
    'active'
  );

  const badge3Code = 'SKB-SQL-3918';
  const badge3IssuedAt = new Date(Date.now() - 10 * 86400000).toISOString();
  insertBadge.run(
    'badge-priya-sql',
    badge3Code,
    user2Id,
    'SQL',
    asmSqlId,
    96.0,
    'Expert',
    badge3IssuedAt,
    generateBadgeHash(badge3Code, user2Id, 'SQL', 96.0, badge3IssuedAt),
    'active'
  );

  // 8. Portfolios (Non-traditional practical proofs)
  const insertPortfolio = db.prepare(`
    INSERT INTO portfolios (id, user_id, title, description, problem_solved, skills_used, github_url, live_demo_url, screenshot_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPortfolio.run(
    'port-arjun-1',
    user1Id,
    'AgriMarket Direct - Farmer-to-Consumer Marketplace',
    'Full-stack progressive web app allowing rural farmers in Madhya Pradesh to list fresh produce directly to urban buyers without middleman commissions.',
    'Eliminated 35% commission loss for rural farmers through SMS alerts and bilingual mobile-first ordering interface.',
    JSON.stringify(['React', 'Node.js', 'Express', 'SQL', 'Tailwind CSS']),
    'https://github.com/arjun-sharma-dev/agrimarket-direct',
    'https://agrimarket-demo.vercel.app',
    'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&auto=format&fit=crop&q=80',
    now
  );

  insertPortfolio.run(
    'port-arjun-2',
    user1Id,
    'DevMetrics - GitHub Team Velocity Visualizer',
    'Dashboard analyzing commit cadences, pull request review bottlenecks, and test coverage trends for distributed open source teams.',
    'Provides automated PR health scores and team burnout prevention alerts.',
    JSON.stringify(['React', 'TypeScript', 'Tailwind CSS', 'REST APIs']),
    'https://github.com/arjun-sharma-dev/devmetrics-dashboard',
    'https://devmetrics-demo.vercel.app',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    now
  );

  insertPortfolio.run(
    'port-priya-1',
    user2Id,
    'E-Commerce Customer Churn Prediction & Cohort Dashboard',
    'End-to-end data analytics pipeline predicting customer churn probability and cohort retention curves.',
    'Identified key churn risk factors, increasing retained subscriber segments by 18% in simulated backtests.',
    JSON.stringify(['Python', 'Pandas', 'SQL', 'Data Analysis']),
    'https://github.com/priyapatel-data/churn-analytics-pipeline',
    'https://churn-analytics.streamlit.app',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    now
  );

  // 9. Pre-existing Applications with AI Job-Fit Breakdowns
  const insertApp = db.prepare(`
    INSERT INTO applications (id, job_id, user_id, fit_score, fit_score_breakdown, status, cover_letter, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertApp.run(
    'app-arjun-job1',
    job1Id,
    user1Id,
    88.5,
    JSON.stringify({
      overall_percentage: 88.5,
      matched_skills: [
        { name: 'React', is_verified: true, badge_code: 'SKB-REACT-8921', score: 92 },
        { name: 'Node.js', is_verified: false },
        { name: 'JavaScript', is_verified: false },
        { name: 'SQL', is_verified: false }
      ],
      missing_skills: [
        { name: 'Docker', importance: 'preferred' }
      ],
      portfolio_evidence: [
        { project_title: 'AgriMarket Direct', matched_skills: ['React', 'Node.js', 'SQL'] }
      ],
      ai_explanation: 'Strong candidate match (88.5%). Candidate holds a verified credential in React (92%) and demonstrable full-stack production projects utilizing Node.js and SQL. Docker is the only preferred skill not yet formally verified.',
      confidence_level: 'High'
    }),
    'Shortlisted',
    'I have built production web applications with React, Node.js, and SQL, and verified my skills on SkillBridge. I look forward to contributing to TechCorp!',
    now,
    now
  );

  // 10. Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, action, category, ip_address, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run(
    uuidv4(),
    user1Id,
    'BADGE_ISSUED',
    'BADGE_ISSUED',
    '127.0.0.1',
    JSON.stringify({ badge_code: 'SKB-REACT-8921', skill: 'React', score: 92.0 }),
    badge1IssuedAt
  );

  insertAudit.run(
    uuidv4(),
    user1Id,
    'USER_LOGIN',
    'AUTH',
    '127.0.0.1',
    JSON.stringify({ method: 'biometric_webauthn', status: 'SUCCESS' }),
    now
  );

  console.log('✅ Database seeded successfully with demo users, jobs, taxonomy, assessments, and badges!');
}

if (process.argv[1]?.includes('seed.ts')) {
  seedDatabase();
}
