import { HeroElement } from "./model/hero-element";
import { Buff } from "./model/buff";
import { Hero } from "./model/hero";
import { Affinity } from "./model/affinity";

export class ArenaDamageCalculator {
  private randomFloat = Math.random();
  private weakestDefenders: Hero[] = [];
  private neutralDefenders: Hero[] = []
  private strongestDefenders: Hero[] = [];

  /**
   * Precondition - fight is not already won (there is still one defender with lp > 0)
   */
  computeDamage(attacker: Hero, defenders: Hero[]): Hero[] {
    if(!attacker || attacker.lp <= 0 || attacker.pow <= 0 || defenders.length === 0) {
      return defenders;
    }
    
    if (!attacker.buffs.includes(Buff.Holy)) {
      this.determinesDefendersAffinity(attacker.element, defenders);
      this.sortedDefendersDependingAffinity(defenders);
    }
    
    const defenderToAttack = this.getDefenderToAttack(defenders);
    
    const damages = this.getDamages(attacker, defenderToAttack);
    
    this.attackDefender(damages, defenderToAttack);
    
    return defenders;

  }

  determinesDefendersAffinity(attackerElement: HeroElement, defenders: Hero[]) {
    for(const defender of defenders) {
      if (defender.lp <= 0) { continue; }
      defender.setAffinity(this.determinesDefenderAffinity(attackerElement, defender.element));
    }
  }

  determinesDefenderAffinity(attackerElement: HeroElement, defenderElement: HeroElement): Affinity {
    switch (attackerElement) {
      case HeroElement.Fire:
        return defenderElement === HeroElement.Fire ? Affinity.Neutral : defenderElement === HeroElement.Earth ? Affinity.Strong : Affinity.Weak
      case HeroElement.Water:
        return defenderElement === HeroElement.Fire ? Affinity.Weak : defenderElement === HeroElement.Earth ? Affinity.Strong : Affinity.Neutral
      case HeroElement.Earth:
        return defenderElement === HeroElement.Fire ? Affinity.Strong : defenderElement === HeroElement.Earth ? Affinity.Neutral : Affinity.Weak
    }
  }

  sortedDefendersDependingAffinity(defenders: Hero[]) {
    for(const defender of defenders) {
      switch (defender.affinity) {
        case Affinity.Weak:
          this.weakestDefenders.push(defender)
          break;
        case Affinity.Strong:
          this.strongestDefenders.push(defender)
          break;
        case Affinity.Neutral:
          this.neutralDefenders.push(defender)
          break;
      }
    }
  }

  getDefenderToAttack(defenders: Hero[]) {
    return this.weakestDefenders.length && this.weakestDefenders[Math.floor(this.randomFloat * this.weakestDefenders.length)] || this.neutralDefenders.length && this.neutralDefenders[Math.floor(this.randomFloat * this.neutralDefenders.length)] || this.strongestDefenders[Math.floor(this.randomFloat * this.strongestDefenders.length)] || defenders[Math.floor(this.randomFloat * defenders.length)];
  }

  getDamagesDependingAffinity(damages: number, affinityToAttacker: Affinity | null): number {
    switch (affinityToAttacker) {
      case Affinity.Weak:
        return damages *= 1.2;
      case Affinity.Strong:
        return damages *= 0.8;
      default:
        return damages;
    }
  }

  getDamages(attacker: Hero, defenderToAttack: Hero) {
    let damages = attacker.pow;
    const isCriticalHit = this.randomFloat * 100 < attacker.crtr;

    // DAMAGES CALCUL WITH CRITICAL
    if(isCriticalHit) damages = this.getCriticalDamages(attacker.pow, attacker.leth)
    
    // DAMAGES CALCUL WITH ATTACK BUFFS
    if(attacker.buffs.includes(Buff.Attack)) damages *= 1.25;

    // DAMAGES CALCUL WITH DEFENSE BUFF
    if(defenderToAttack.buffs.includes(Buff.Defense)) damages *= 0.75;

    // DAMAGES CALCUl WITH DEF
    if (attacker.buffs.includes(Buff.Holy)) {
      damages *= 0.8;
    } else {
      damages = this.getDamagesDependingDef(damages, defenderToAttack.def);
      // DAMAGES CALCUL WITH AFFINITY
      damages = this.getDamagesDependingAffinity(damages, defenderToAttack.affinity);
    }
  
    return Math.floor(damages);
  }

  getCriticalDamages(attackerPow: number, attackerLeth: number) {
    return (attackerPow + (0.5 + attackerLeth/ 5000) * attackerPow)
  }

  getDamagesDependingDef(damages: number, defenderDef: number) {
    return damages * (1-defenderDef/7500);
  }

  attackDefender(damages: number, defender: Hero) {
    defender.lp = defender.lp - damages
    if (defender.lp < 0) {
      defender.lp = 0;
    }
  }
}