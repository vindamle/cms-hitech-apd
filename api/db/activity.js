const logger = require('../logger')('db activity model');

module.exports = () => ({
  apdActivity: {
    tableName: 'activities',

    apd() {
      return this.belongsTo('apd');
    },

    goals() {
      return this.hasMany('apdActivityGoal');
    },

    approaches() {
      return this.hasMany('apdActivityApproach');
    },

    expenses() {
      return this.hasMany('apdActivityExpense');
    },

    schedule() {
      return this.hasMany('apdActivitySchedule');
    },

    static: {
      updateableFields: ['name', 'description'],
      owns: {
        goals: 'apdActivityGoal',
        approaches: 'apdActivityApproach',
        expenses: 'apdActivityExpense',
        schedule: 'apdActivitySchedule'
      },
      foreignKey: 'activity_id',
      withRelated: [
        'approaches',
        'goals',
        'goals.objectives',
        'expenses',
        'expenses.entries',
        'schedule'
      ]
    },

    async validate({ transacting }) {
      logger.silly('validating');

      if (this.hasChanged('name')) {
        const name = this.attributes.name;

        if (typeof name !== 'string' || name.length < 1) {
          logger.verbose('name is not a string or is empty');
          throw new Error('activity-name-invalid');
        }

        const hasName = await this.where({ name }).fetchAll({ transacting });
        if (hasName.length) {
          logger.verbose('another activity already has this name');
          throw new Error('activity-name-exists');
        }
      }
    },

    toJSON() {
      return {
        id: this.get('id'),
        name: this.get('name'),
        description: this.get('description'),
        goals: this.related('goals'),
        approaches: this.related('approaches'),
        expenses: this.related('expenses'),
        schedule: this.related('schedule')
      };
    }
  },

  apdActivityGoal: {
    tableName: 'activity_goals',

    activity() {
      return this.belongsTo('apdActivity');
    },

    objectives() {
      return this.hasMany('apdActivityGoalObjective');
    },

    toJSON() {
      return {
        description: this.get('description'),
        objectives: this.related('objectives')
      };
    },

    static: {
      updateableFields: ['description'],
      owns: { objectives: 'apdActivityGoalObjective' },
      foreignKey: 'activity_goal_id'
    }
  },

  apdActivityGoalObjective: {
    tableName: 'activity_goal_objectives',

    goal() {
      return this.belongsTo('apdActivityGoal');
    },

    toJSON() {
      return this.get('description');
    },

    static: {
      updateableFields: ['description']
    }
  },

  apdActivityApproach: {
    tableName: 'activity_approaches',

    activity() {
      return this.belongsTo('apdActivity');
    },

    toJSON() {
      return {
        description: this.get('description'),
        alternatives: this.get('alternatives'),
        explanation: this.get('explanation')
      };
    },

    static: {
      updateableFields: ['description', 'alternatives', 'explanation']
    }
  },

  apdActivityExpense: {
    tableName: 'activity_expenses',

    activity() {
      return this.belongsTo('apdActivity');
    },

    entries() {
      return this.hasMany('apdActivityExpenseEntry', 'expense_id');
    },

    toJSON() {
      return {
        id: this.get('id'),
        name: this.get('name'),
        entries: this.related('entries')
      };
    },

    static: {
      updateableFields: ['name'],
      owns: { entries: 'apdActivityExpenseEntry' },
      foreignKey: 'expense_id'
    }
  },

  apdActivityExpenseEntry: {
    tableName: 'activity_expense_entries',

    expense() {
      return this.belongsTo('apdActivityExpense', 'expense_id');
    },

    toJSON() {
      return {
        id: this.get('id'),
        year: this.get('year'),
        amount: this.get('amount'),
        description: this.get('description')
      };
    },

    static: {
      updateableFields: ['year', 'amount', 'description']
    }
  },

  apdActivitySchedule: {
    tableName: 'activity_schedule',

    activity() {
      return this.belongsTo('apdActivity');
    },

    toJSON() {
      return {
        actualEnd: this.get('actual_end'),
        actualStart: this.get('actual_start'),
        milestone: this.get('milestone'),
        plannedEnd: this.get('planned_end'),
        plannedStart: this.get('planned_start'),
        status: this.get('status')
      };
    },

    static: {
      updateableFields: [
        'actualEnd',
        'actualStart',
        'milestone',
        'plannedEnd',
        'plannedStart',
        'status'
      ]
    }
  }
});
