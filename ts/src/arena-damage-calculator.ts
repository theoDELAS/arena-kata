import { HeroElement } from "./model/hero-element";
import { Buff } from "./model/buff";
import { Hero } from "./model/hero";

export class ArenaDamageCalculator {

  /**
   * Precondition - fight is not already won (there is still one defender with lp > 0)
   */
  computeDamage(attacker: Hero, defenders: Hero[]): Hero[] {
    const weakestDefenders = [];
    const neutralDefenders = [];
    const strongerDefenders = [];

    if(attacker.element === HeroElement.Water) {
      for(const defender of defenders) {
        if (defender.lp <= 0) { continue; }
        if (defender.element === HeroElement.Fire) {
          weakestDefenders.push(defender);
        } else if (defender.element === HeroElement.Water) {
          neutralDefenders.push(defender);
        } else {
          strongerDefenders.push(defender);
        }
      }
    } else if(attacker.element === HeroElement.Fire) {
      for(const defender of defenders) {
        if (defender.lp <= 0) { continue; }
        if (defender.element === HeroElement.Fire) {
          neutralDefenders.push(defender);
        } else if (defender.element === HeroElement.Water) {
          strongerDefenders.push(defender);
        } else {
          weakestDefenders.push(defender);
        }
      } 
    } else {    // Hero is of type water
      for(const defender of defenders) {
        if (defender.lp <= 0) { continue; }
        if (defender.element === HeroElement.Fire) {
          strongerDefenders.push(defender);
        } else if (defender.element === HeroElement.Water) {
          weakestDefenders.push(defender);
        } else {
          neutralDefenders.push(defender);
        }
      }
    }

    const defenderAttacked = weakestDefenders.length && weakestDefenders[Math.floor(Math.random() * weakestDefenders.length)] || neutralDefenders.length && neutralDefenders[Math.floor(Math.random() * neutralDefenders.length)] || strongerDefenders[Math.floor(Math.random() * strongerDefenders.length)];

    const isCriticalHit = Math.random() * 100 < attacker.crtr;
    let damages = 0;
    if(isCriticalHit) {
      damages = (attacker.pow + (0.5 + attacker.leth/ 5000) * attacker.pow) * (1-defenderAttacked.def/7500)
    } else {
      damages = attacker.pow * (1-defenderAttacked.def/7500);
    }

    // BUFFS
    if(attacker.buffs.includes(Buff.Attack)) {
      if (isCriticalHit) {
        damages += (attacker.pow * 0.25 + (0.5 + attacker.leth/ 5000) * attacker.pow * 0.25) * (1-defenderAttacked.def/7500)
      } else {
        damages += attacker.pow * 0.25 * (1-defenderAttacked.def/7500);
      }
    }

    if(defenderAttacked.buffs.includes(Buff.Defense)) {
      damages = damages / (1-defenderAttacked.def/7500) * (1-defenderAttacked.def/7500 - 0.25);
    }
    
    if (damages > 0) {
      if(weakestDefenders.find(defender => defender === defenderAttacked)) {
        damages = damages + damages * 20/100
      } else if (neutralDefenders.find(defender => defender === defenderAttacked)) {
      } else {
        damages = damages - damages * 20/100
      }

      damages = Math.floor(damages);
      if (damages > 0) {
        defenderAttacked.lp = defenderAttacked.lp - damages
        if (defenderAttacked.lp < 0) {
          defenderAttacked.lp = 0;
        }
      }
    }

    return defenders;
  }
}