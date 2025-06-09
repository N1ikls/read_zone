import * as helper from './helper.js';
import { v4 as uuid4 } from 'uuid';

export async function seed(knex) {
  const userIds = await knex('user').pluck('id');

  const teams = [];
  const comments = [];
  const subscribers = [];
  const teammates = [];

  const getRandomUserId = () =>
    userIds[Math.floor(Math.random() * userIds.length)];

  const randomComment = (id, teamId, parentId) => {
    return {
      id: id,
      parent_id: parentId,
      team_id: teamId,
      created_by: getRandomUserId(),
      content: helper.randomContent(`Коммент ${id} к команде ${teamId}`, 5),
    };
  };

  for (let id = 1; id <= helper.TEAMS_COUNT; id++) {
    const teamsId = uuid4();
    teams.push({
      id: teamsId,
      created_by: getRandomUserId(),
      name: `Команда ${id}`,
      description: helper.randomContent(`Описание комманды ${id}`, 20),
    });

    const commentsCount = helper.random(0, 30);
    for (let i = 0; i < commentsCount; i++) {
      const commentId = uuid4();
      comments.push(randomComment(commentId, teamsId));

      const subcommentsCount = helper.random(0, 5);
      const parentId = commentId;
      for (let j = 0; j < subcommentsCount; j++) {
        comments.push(randomComment(commentId, teamsId, parentId));
      }
    }

    const subscribersCount = helper.random(0, 30);
    for (let i = 0; i < subscribersCount; i++) {
      subscribers.push({
        team_id: teamsId,
        subscriber_id: getRandomUserId(),
      });
    }

    const teammatesCount = helper.random(0, 10);
    for (let i = 0; i < teammatesCount; i++) {
      teammates.push({ team_id: teamsId, user_id: getRandomUserId() });
    }
  }

  await knex('team').insert(teams).onConflict().ignore();
  await knex('team_comment').insert(comments).onConflict().ignore();
  await knex('team_subscriber').insert(subscribers).onConflict().ignore();
  await knex('team_teammate').insert(teammates).onConflict().ignore();
}
