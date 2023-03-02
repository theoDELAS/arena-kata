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
    const attackerIsNotValid= !attacker || attacker.lp <= 0 || attacker.pow <= 0 || defenders.length === 0
    
    if(attackerIsNotValid) {
      return defenders;
    }

    if (!attacker.buffs.includes(Buff.Holy)) {
      this.setDefendersAffinity(attacker, defenders);

      this.weakestDefenders = this.filterDefendersByAffinity(defenders, Affinity.Weak);
      this.neutralDefenders = this.filterDefendersByAffinity(defenders, Affinity.Neutral);
      this.strongestDefenders = this.filterDefendersByAffinity(defenders, Affinity.Strong);
  }

    const defenderToAttack = this.getDefenderToAttack();
    const damages = this.getDamages(attacker, defenderToAttack);
    
    this.attackDefender(damages, defenderToAttack);
    
    return defenders;

  }

  private setDefendersAffinity(attacker: Hero, defenders: Hero[]) {
    for(const defender of defenders) {
      if (defender.lp <= 0) { continue; }
      defender.setAffinity(this.getDefenderAffinity(attacker, defender));
    }
  }

  private getDefenderAffinity(attacker: Hero, defender: Hero): Affinity {
    if (attacker.element === defender.element) { 
      return Affinity.Neutral
    } else if (attacker.getWeakness() === defender.element) {
      return Affinity.Strong;
    } else {
      return Affinity.Weak;
    }
  }

  private filterDefendersByAffinity(defenders: Hero[], affinity: Affinity): Hero[] {
    return defenders.filter(hero => hero.affinity == affinity)
  }


  private getDefenderToAttack() {
    return this.weakestDefenders.length 
    && this.weakestDefenders[Math.floor(this.randomFloat * this.weakestDefenders.length)] 
    || this.neutralDefenders.length 
    && this.neutralDefenders[Math.floor(this.randomFloat * this.neutralDefenders.length)] 
    || this.strongestDefenders[Math.floor(this.randomFloat * this.strongestDefenders.length)];
  }

  private getDamagesPerAffinity(damages: number, affinityToAttacker: Affinity | null): number {
    switch (affinityToAttacker) {
      case Affinity.Weak:
        return damages *= 1.2;
      case Affinity.Strong:
        return damages *= 0.8;
      default:
        return damages;
    }
  }

  private getDamages(attacker: Hero, defenderToAttack: Hero) {
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
      damages = this.getDamagesPerAffinity(damages, defenderToAttack.affinity);
    }
  
    return Math.floor(damages);
  }

  private getCriticalDamages(attackerPow: number, attackerLeth: number) {
    return (attackerPow + (0.5 + attackerLeth/ 5000) * attackerPow)
  }

  private getDamagesDependingDef(damages: number, defenderDef: number) {
    return damages * (1-defenderDef/7500);
  }

  private attackDefender(damages: number, defender: Hero) {
    defender.lp = defender.lp - damages
    if (defender.lp < 0) {
      defender.lp = 0;
    }
  }
}