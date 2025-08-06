/**
 * Production-ready Rotation Manager for cyclic content rotation
 * Ensures all items are shown in sequence before repeating
 */
export class RotationManager {
  constructor(knex) {
    this.knex = knex;
    this.table = 'rotation_state';
  }

  /**
   * Get next offset for cyclic rotation
   * @param {string} rotationKey - Unique key for rotation type
   * @param {number} totalItems - Total number of items available
   * @param {number} itemsPerPage - Number of items per page
   * @returns {Promise<{offset: number, cycleInfo: object, needsCyclicFill: boolean}>}
   */
  async getNextOffset(rotationKey, totalItems, itemsPerPage = 4) {
    if (totalItems === 0) {
      return { offset: 0, cycleInfo: { isNewCycle: false, cycleCount: 0 } };
    }

    // Use transaction for thread-safety
    return await this.knex.transaction(async (trx) => {
      try {
        // Get or create rotation state
        let rotationState = await trx(this.table)
          .where('rotation_key', rotationKey)
          .first();

        const now = new Date();
        let isNewCycle = false;

        if (!rotationState) {
          // Create new rotation state
          rotationState = {
            rotation_key: rotationKey,
            current_offset: 0,
            total_items: totalItems,
            items_per_page: itemsPerPage,
            last_updated: now,
            cycle_started_at: now,
            cycle_count: 0,
            metadata: { created_at: now.toISOString() },
          };

          await trx(this.table).insert(rotationState);
          isNewCycle = true;
        } else {
          // Check if total items changed (new books added/removed)
          if (rotationState.total_items !== totalItems) {
            console.log(
              `[RotationManager] Total items changed from ${rotationState.total_items} to ${totalItems} for ${rotationKey}`,
            );

            // Reset rotation if total changed significantly
            if (
              Math.abs(rotationState.total_items - totalItems) > itemsPerPage
            ) {
              rotationState.current_offset = 0;
              rotationState.cycle_started_at = now;
              rotationState.cycle_count += 1;
              isNewCycle = true;
            }

            rotationState.total_items = totalItems;
          }

          // Calculate next offset
          const nextOffset = rotationState.current_offset + itemsPerPage;

          if (nextOffset >= totalItems) {
            // Cycle completed, start new cycle
            rotationState.current_offset = 0;
            rotationState.cycle_started_at = now;
            rotationState.cycle_count += 1;
            isNewCycle = true;
            console.log(
              `[RotationManager] Cycle ${rotationState.cycle_count} completed for ${rotationKey}, starting new cycle`,
            );
          } else {
            rotationState.current_offset = nextOffset;
          }

          rotationState.last_updated = now;
          rotationState.items_per_page = itemsPerPage;

          // Update rotation state
          await trx(this.table).where('rotation_key', rotationKey).update({
            current_offset: rotationState.current_offset,
            total_items: rotationState.total_items,
            items_per_page: rotationState.items_per_page,
            last_updated: rotationState.last_updated,
            cycle_started_at: rotationState.cycle_started_at,
            cycle_count: rotationState.cycle_count,
            updated_at: now,
          });
        }

        const cycleInfo = {
          isNewCycle,
          cycleCount: rotationState.cycle_count,
          currentPage:
            Math.floor(rotationState.current_offset / itemsPerPage) + 1,
          totalPages: Math.ceil(totalItems / itemsPerPage),
          cycleStartedAt: rotationState.cycle_started_at,
          lastUpdated: rotationState.last_updated,
          itemsPerPage: rotationState.items_per_page,
          totalItems: rotationState.total_items,
        };

        // Проверяем, нужно ли циклическое заполнение
        const needsCyclicFill =
          rotationState.current_offset + itemsPerPage > totalItems;
        const remainingItems = totalItems - rotationState.current_offset;

        console.log(
          `[RotationManager] ${rotationKey}: offset=${rotationState.current_offset}, cycle=${rotationState.cycle_count}, page=${cycleInfo.currentPage}/${cycleInfo.totalPages}, needsCyclicFill=${needsCyclicFill}`,
        );

        return {
          offset: rotationState.current_offset,
          cycleInfo,
          needsCyclicFill,
          remainingItems: needsCyclicFill ? remainingItems : itemsPerPage,
        };
      } catch (error) {
        console.error(
          `[RotationManager] Error in getNextOffset for ${rotationKey}:`,
          error,
        );
        throw error;
      }
    });
  }

  /**
   * Reset rotation cycle for a specific key
   * @param {string} rotationKey - Rotation key to reset
   * @returns {Promise<boolean>}
   */
  async resetRotation(rotationKey) {
    try {
      const now = new Date();
      const updated = await this.knex(this.table)
        .where('rotation_key', rotationKey)
        .update({
          current_offset: 0,
          cycle_started_at: now,
          cycle_count: 0,
          last_updated: now,
          updated_at: now,
        });

      console.log(`[RotationManager] Reset rotation for ${rotationKey}`);
      return updated > 0;
    } catch (error) {
      console.error(
        `[RotationManager] Error resetting rotation for ${rotationKey}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Get rotation statistics
   * @param {string} rotationKey - Rotation key
   * @returns {Promise<object|null>}
   */
  async getRotationStats(rotationKey) {
    try {
      const stats = await this.knex(this.table)
        .where('rotation_key', rotationKey)
        .first();

      if (!stats) return null;

      return {
        rotationKey: stats.rotation_key,
        currentOffset: stats.current_offset,
        totalItems: stats.total_items,
        itemsPerPage: stats.items_per_page,
        currentPage:
          Math.floor(stats.current_offset / stats.items_per_page) + 1,
        totalPages: Math.ceil(stats.total_items / stats.items_per_page),
        cycleCount: stats.cycle_count,
        cycleStartedAt: stats.cycle_started_at,
        lastUpdated: stats.last_updated,
        metadata: stats.metadata,
      };
    } catch (error) {
      console.error(
        `[RotationManager] Error getting stats for ${rotationKey}:`,
        error,
      );
      return null;
    }
  }
}

export default RotationManager;
