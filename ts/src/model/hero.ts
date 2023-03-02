import { Affinity } from "./affinity";
import { Buff } from "./buff";
import { HeroElement } from "./hero-element";

export class Hero {
  public buffs: Buff[] = [];
  affinity: Affinity | null;

  constructor(
    readonly element: HeroElement, 
    readonly pow: number, 
    readonly def: number, 
    readonly leth: number, 
    readonly crtr: number, 
    public lp: number, 
    affinity: Affinity  | null = null) {
    this.affinity = affinity;
  }

  
  public getAffinty() : Affinity | null {
    return this.affinity
  }
  
  public setAffinity(affinity : Affinity) {
    this.affinity = affinity;
  }

  setBuffs(buffs: Buff[]): Hero {
    this.buffs = buffs;
    return this
}
  public getWeakness(): HeroElement {
    switch (this.element) {
      case HeroElement.Earth: 
        return HeroElement.Fire
      case HeroElement.Fire:
        return HeroElement.Water
      case HeroElement.Water:
        return HeroElement.Earth
    } 
  }
  
}