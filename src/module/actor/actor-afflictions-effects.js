export class ActorAfflictionsEffects {

  /**
   * Map of <afflictionName> : <localizationWarningMessage>
   */
  static afflictionsWarningMessagesMap = new Map([
    ['blinded', 'DL.DialogWarningBlindedChallengeFailer'],
    ['dazed', 'DL.DialogWarningDazedFailer'],
    ['defenseless', 'DL.DialogWarningDefenselessFailer'],
    ['stunned', 'DL.DialogWarningStunnedFailer'],
    ['surprised', 'DL.DialogWarningSurprisedFailer'],
    ['unconscious', 'DL.DialogWarningUnconsciousFailer']
  ])

  /**s
   * Checks if an actor is afflicted. Return true and shows an error message if one of the actor afflictions is in
   * blockingAfflictionsList
   * @param actor The actor to check
   * @param blockingAfflictionsList: List[string], the afflictions to check. Example ['stunned', 'dazed']
   */
  static checkRollBlockingAfflictions(actor, blockingAfflictionsList) {
    for (let affliction of blockingAfflictionsList) {
      let isAfflicted = actor.data.data.afflictions[affliction]
      if (isAfflicted) {
        ui.notifications.error(game.i18n.localize(this.afflictionsWarningMessagesMap[affliction]))
        return true
      }
    }
    return false
  }

  /**
   * Checks if an actor is afflicted by the affliction (single value) and it does so only if the booleanValue is true
   * @param actor
   * @param affliction: string
   * @param booleanValue
   */
  static checkConditionalRollBlockingAffliction(actor, affliction, booleanValue) {
    if (!booleanValue) return false
    let isAfflicted = actor.data.data.afflictions[affliction]

    if (isAfflicted) {
      ui.notifications.error(game.i18n.localize(this.afflictionsWarningMessagesMap[affliction]))
      return true
    }
    return false
  }

  /**
   * Build the list of effects that give boons/banes to an action.
   * Used in printing the chat message relative to the action
   * @param actor
   * @param type: string, type of action being performed
   * @param boonsbanesEffectList: List[string] of afflictions/actions to check
   * @param number: {int | string} the number of boons (+) or banes (-) added by the effect
   * @returns {string|null}
   */
  static buildAfflictionsEffects = (actor, type, boonsbanesEffectList, number) => {
    // NOTE: Since the code is the same for all three, i grouped them here
    let boonsbanesString = ""
    switch (type) {
      case 'SPELL':
      case 'CHALLENGE':
        boonsbanesString = game.i18n.localize('DL.TalentChallengeBoonsBanes')
        break
      case 'ATTACK':
        boonsbanesString = game.i18n.localize('DL.TalentAttackBoonsBanes')
        break
      default:
        return null
    }

    let effectsString = ""
    // Also works for ActionEffects
    for (let effect of boonsbanesEffectList) {
      const isAffected = actor.data.data.afflictions[effect] || actor.data.data.actions[effect]
      if (isAffected) {
        const afflictionString = game.i18n.localize(`DL.${effect}`)
        effectsString += `${afflictionString}:<br>
                          &nbsp;&nbsp;&nbsp;• ${boonsbanesString}: ${number}<br>`
      }
    }
    return effectsString
  }

  static characteristicsBoonsBaneLocalizationMap = new Map([
    ['strengthboonsbanesselect', 'DL.AttributeStrength'],
    ['agilityboonsbanesselect', 'DL.AttributeAgility'],
    ['intellectboonsbanesselect', 'DL.AttributeIntellect'],
    ['willboonsbanesselect', 'DL.AttributeWill'],
    ['perceptionboonsbanesselect', 'DL.AttributePerception']
  ])

  static buildTalentEffects = (actor, talent, showTalentName, type) => {
    let effects = showTalentName ? `${talent.name}:<br>` : ""
    const talentBOBAString = game.i18n.localize('DL.TalentAttackBoonsBanes')
    const action = talent.data?.action

    // Boons and Banes
    if (action?.boonsbanesactive && action?.boonsbanes) {
      for (const [attributeboonsbanesselect, localizationString]
        of ActorAfflictionsEffects.characteristicsBoonsBaneLocalizationMap) {
        effects += !action[attributeboonsbanesselect] ? "" :
          `&nbsp;&nbsp;&nbsp;• ${talentBOBAString} (${game.i18n.localize(localizationString)}): ${action?.boonsbanes} <br>`
      }}

    const toMessageEffect = (locale, value) =>
      `&nbsp;&nbsp;&nbsp;• ${game.i18n.localize(locale)}: ${value} <br>`

    // Damage and Plus20
    if (action?.damageactive && action?.damage)
      effects += toMessageEffect('DL.TalentExtraDamage', action.damage)
    if (action?.plus20active && action?.plus20)
      effects += toMessageEffect('DL.TalentExtraDamage20plus', action.plus20)
    // If talent, return
    if (type !== 'TALENT') {
      return effects === `${talent.name}:<br>` ? "" : effects
    }


    //// Below, type === 'TALENT'
    const challenge = talent.data?.challenge
    const data = talent.data

    // Boons and Banes
    if (challenge?.boonsbanesactive && challenge?.boonsbanes) {
      for (const [attributeboonsbanesselect, localizationString]
        of ActorAfflictionsEffects.characteristicsBoonsBaneLocalizationMap) {
        effects += !challenge[attributeboonsbanesselect] ? "" :
          `&nbsp;&nbsp;&nbsp;• ${talentBOBAString} (${game.i18n.localize(localizationString)}): ${challenge?.boonsbanes} <br>`
      }}

    if (data?.vs?.boonsbanesactive && data?.vs?.boonsbanes)
      effects += toMessageEffect('DL.TalentVSBoonsBanes', data.vs.boonsbanes)
    if (data?.vs?.damageactive && data?.vs?.damage)
      effects += toMessageEffect('DL.TalentVSDamage', data.vs.damage)
    if (data?.healing?.healactive && data?.healing?.rate)
      effects += toMessageEffect('DL.TalentHealing', data.healing.rate)
    if (data?.damage)
      effects += toMessageEffect('DL.TalentDamage', data.damage)

    const bonuses = talent.data?.bonuses
    if (!showTalentName && bonuses) {
      if (bonuses?.defenseactive && bonuses?.defense)
        effects += toMessageEffect('DL.TalentBonusesDefense', bonuses.defense)
      if (bonuses?.healthactive && bonuses?.health)
        effects += toMessageEffect('DL.TalentBonusesHealth', bonuses.health)
      if (bonuses?.speedactive && bonuses?.speed)
        effects += toMessageEffect('DL.TalentBonusesSpeed', bonuses.speed)
      if (bonuses?.poweractive && bonuses?.power)
        effects += toMessageEffect('DL.TalentBonusesPower', bonuses.power)
    }

    return effects === `${talent.name}:<br>` ? "" : effects
  }

}
