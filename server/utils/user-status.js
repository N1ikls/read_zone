/**
 * Проверяет статус пользователя (бан, мут)
 * @param {Object} storage - объект storage
 * @param {string} userId - ID пользователя
 * @returns {Object} - статус пользователя
 */
export async function checkUserStatus(storage, userId) {
  if (!userId) {
    return { isBanned: false, isMuted: false, banInfo: null, muteInfo: null };
  }

  try {
    // Проверяем активные баны и муты
    const activeRestrictions = await storage.user
      .knex('user_bans')
      .where('user_id', userId)
      .where('is_active', true)
      .where(function() {
        this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
      })
      .orderBy('created_at', 'desc');

    const banInfo = activeRestrictions.find(r => r.type === 'ban');
    const muteInfo = activeRestrictions.find(r => r.type === 'mute');

    return {
      isBanned: !!banInfo,
      isMuted: !!muteInfo,
      banInfo: banInfo || null,
      muteInfo: muteInfo || null,
      restrictions: activeRestrictions
    };
  } catch (error) {
    console.error('Error checking user status:', error);
    return { isBanned: false, isMuted: false, banInfo: null, muteInfo: null };
  }
}

/**
 * Проверяет, может ли пользователь комментировать
 * @param {Object} storage - объект storage
 * @param {string} userId - ID пользователя
 * @returns {boolean} - может ли пользователь комментировать
 */
export async function canUserComment(storage, userId) {
  const status = await checkUserStatus(storage, userId);
  return !status.isBanned && !status.isMuted;
}

/**
 * Проверяет, может ли пользователь создавать контент
 * @param {Object} storage - объект storage
 * @param {string} userId - ID пользователя
 * @returns {boolean} - может ли пользователь создавать контент
 */
export async function canUserCreateContent(storage, userId) {
  const status = await checkUserStatus(storage, userId);
  return !status.isBanned;
}
