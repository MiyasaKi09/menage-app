import { CharacterPower } from './types'

interface PowerResult {
  finalPoints: number
  bonusApplied: boolean
  bonusDescription: string | null
  bonusPoints: number
}

export function calculateBonusPoints(
  basePoints: number,
  categoryName: string,
  power: CharacterPower | null
): PowerResult {
  if (!power) {
    return { finalPoints: basePoints, bonusApplied: false, bonusDescription: null, bonusPoints: 0 }
  }

  switch (power.power_type) {
    case 'category_bonus': {
      if (power.power_value.category === categoryName) {
        const bonus = Math.round(basePoints * (power.power_value.bonus_percent / 100))
        return {
          finalPoints: basePoints + bonus,
          bonusApplied: true,
          bonusDescription: `+${power.power_value.bonus_percent}% ${power.power_value.category}`,
          bonusPoints: bonus,
        }
      }
      return { finalPoints: basePoints, bonusApplied: false, bonusDescription: null, bonusPoints: 0 }
    }

    case 'point_multiplier': {
      const bonus = Math.round(basePoints * power.power_value.multiplier) - basePoints
      return {
        finalPoints: Math.round(basePoints * power.power_value.multiplier),
        bonusApplied: true,
        bonusDescription: `x${power.power_value.multiplier} points`,
        bonusPoints: bonus,
      }
    }

    case 'time_reduction': {
      // Time reduction doesn't affect points directly
      return { finalPoints: basePoints, bonusApplied: false, bonusDescription: null, bonusPoints: 0 }
    }

    case 'streak_shield': {
      // Streak shield doesn't affect points
      return { finalPoints: basePoints, bonusApplied: false, bonusDescription: null, bonusPoints: 0 }
    }

    default:
      return { finalPoints: basePoints, bonusApplied: false, bonusDescription: null, bonusPoints: 0 }
  }
}
