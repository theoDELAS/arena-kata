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
    if(attacker.lp <= 0 || attacker.pow === 0 || defenders.length === 0) {
      return defenders;
    }

    this.determinesDefendersAffinity(attacker.element, defenders);

    this.sortedDefendersDependingAffinity(defenders);

    const defenderToAttack = this.getDefenderToAttack();
    

    const isCriticalHit = this.randomFloat * 100 < attacker.crtr;
    let damages = 0;
    if(isCriticalHit) {
      damages = (attacker.pow + (0.5 + attacker.leth/ 5000) * attacker.pow) * (1-defenderToAttack.def/7500)
    } else {
      damages = attacker.pow * (1-defenderToAttack.def/7500);
    }

    // BUFFS
    if(attacker.buffs.includes(Buff.Attack)) {
      if (isCriticalHit) {
        damages += (attacker.pow * 0.25 + (0.5 + attacker.leth/ 5000) * attacker.pow * 0.25) * (1-defenderToAttack.def/7500)
      } else {
        damages += attacker.pow * 0.25 * (1-defenderToAttack.def/7500);
      }
    }

    if(defenderToAttack.buffs.includes(Buff.Defense)) {
      damages = damages / (1-defenderToAttack.def/7500) * (1-defenderToAttack.def/7500 - 0.25);
    }
    
    if (damages > 0) {
      damages = this.getDamages(damages, defenderToAttack.affinity)
    }

    damages = Math.floor(damages);
    if (damages > 0) {
      defenderToAttack.lp = defenderToAttack.lp - damages
      if (defenderToAttack.lp < 0) {
        defenderToAttack.lp = 0;
      }
    }
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

  getDefenderToAttack() {
    return this.weakestDefenders.length && this.weakestDefenders[Math.floor(Math.random() * this.weakestDefenders.length)] || this.neutralDefenders.length && this.neutralDefenders[Math.floor(Math.random() * this.neutralDefenders.length)] || this.strongestDefenders[Math.floor(Math.random() * this.strongestDefenders.length)];
  }

  getDamages(damages: number, affinityToAttacker: Affinity | null): number {
    switch (affinityToAttacker) {
      case Affinity.Weak:
        return damages *= 1.2;
      case Affinity.Strong:
        return damages *= 0.8;
      default:
        return damages;
    }
  }
}