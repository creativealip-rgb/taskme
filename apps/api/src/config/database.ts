import * as dotenv from 'dotenv';
dotenv.config();

interface MockDB {
  users: any[];
  sessions: any[];
  accounts: any[];
  verification: any[];
  tasks: any[];
  subtasks: any[];
  workspaces: any[];
}

const mockDb: MockDB = {
  users: [
    {
      id: 'user-1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  sessions: [],
  accounts: [],
  verification: [],
  tasks: [
    {
      id: 'task-1',
      userId: 'user-1',
      workspaceId: 'project-1',
      title: 'Design homepage wireframes',
      description: 'Create low-fidelity wireframes for the new homepage layout',
      status: 'done',
      priority: 'high',
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'task-2',
      userId: 'user-1',
      workspaceId: 'project-1',
      title: 'Implement navigation menu',
      description: 'Build responsive navigation component with dropdowns',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'task-3',
      userId: 'user-1',
      workspaceId: 'project-2',
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment',
      status: 'in_progress',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  subtasks: [],
  workspaces: [
    {
      id: 'project-1',
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern UI',
      ownerId: 'user-1',
      isPublic: false,
      shareToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'project-2',
      name: 'Mobile App Development',
      description: 'Cross-platform mobile app for iOS and Android',
      ownerId: 'user-1',
      isPublic: false,
      shareToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'project-3',
      name: 'Marketing Campaign',
      description: 'Q2 digital marketing and social media strategy',
      ownerId: 'user-1',
      isPublic: true,
      shareToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'project-4',
      name: 'Internal Tools',
      description: 'Automation and productivity tools for internal use',
      ownerId: 'user-1',
      isPublic: false,
      shareToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

class MockQueryBuilder {
  private db: MockDB;

  constructor(db: MockDB) {
    this.db = db;
  }

  select() {
    return {
      from: (table: string) => {
        return {
          where: (..._conditions: any[]) => {
            return { orderBy: () => this.db[table as keyof MockDB] };
          },
        };
      },
    };
  }

  insert(table: string) {
    return {
      values: (data: any) => {
        const id = data.id || `id-${Date.now()}`;
        const newRecord = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
        this.db[table as keyof MockDB].push(newRecord);
        return { returning: () => [newRecord] };
      },
    };
  }

  update(table: string) {
    return {
      set: (data: any) => {
        return {
          where: (..._conditions: any[]) => {
            const tableData = this.db[table as keyof MockDB];
            if (tableData.length > 0) {
              tableData[0] = { ...tableData[0], ...data, updatedAt: new Date() };
            }
            return { returning: () => [tableData[0]] };
          },
        };
      },
    };
  }

  delete(table: string) {
    return {
      where: (..._conditions: any[]) => {
        return { run: () => {} };
      },
    };
  }
}

export const db = {
  select: () => new MockQueryBuilder(mockDb),
  insert: (table: string) => new MockQueryBuilder(mockDb).insert(table),
  update: (table: string) => new MockQueryBuilder(mockDb).update(table),
  delete: (table: string) => new MockQueryBuilder(mockDb).delete(table),
  getAll: (table: string) => mockDb[table as keyof MockDB],
  getById: (table: string, id: string) => mockDb[table as keyof MockDB].find((item: any) => item.id === id),
};

export const mockDbData = mockDb;
