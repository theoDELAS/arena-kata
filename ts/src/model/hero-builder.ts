import { Buff } from "./buff";
import { HeroElement } from "./hero-element";
import { Hero } from "./hero";


export class HeroBuilder {
    buffs: Buff[] = [];
    element = HeroElement.Water;
    pow = 0;
    def = 0;
    leth = 0;
    crtr = 0;
    lp = 0;

    withBuff(buffs: Buff[]): HeroBuilder {
        this.buffs = buffs;
        return this
    }

    withElement(element: HeroElement): HeroBuilder {
        this.element = element;
        return this
    }

    withPow(pow: number): HeroBuilder {
        this.pow = pow;
        return this
    }

    withDef(def: number): HeroBuilder {
        this.def = def;
        return this
    }

    withLeth(leth: number): HeroBuilder {
        this.leth = leth;
        return this
    }

    withCrtr(crtr: number): HeroBuilder {
        this.crtr = crtr;
        return this
    }

    withLp(lp: number): HeroBuilder {
        this.lp = lp;
        return this
    }

    build(): Hero {
        return new Hero(this.element, this.pow, this.def, this.leth, this.crtr, this.lp);
    }
  }