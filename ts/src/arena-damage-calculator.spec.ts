import { ArenaDamageCalculator } from "./arena-damage-calculator";
import { Hero } from "./model/hero";
import { HeroBuilder } from "./model/hero-builder";
import { HeroElement } from "./model/hero-element";
import { Buff } from "./model/buff";

describe("Arena damage calculator", function() {
  let arenaDamageCalculator: ArenaDamageCalculator;
  // Water defenders  
  let defenderWaterHero: Hero;
  let defenderWaterHeroBUFF: Hero;
  // Fire defenders
  let defenderFireHero1: Hero;
  let defenderFireHero2: Hero;
  let defenderFireHero3: Hero;
  // Earth defenders
  let defenderEarthHero: Hero;
  let defenderEarthHero1800DEF: Hero;
  // Attackers
  let attackerWaterHero: Hero;
  let attackerWaterHeroCRTR: Hero;
  let attackerWaterHeroBUFF: Hero;
  let attackerFireHeroCRTRandLETH: Hero;
  let attackerEarthHero: Hero;
  let attackerEarthHeroNEGATIVE: Hero;

  let waterFireEarthDefenders: Hero[];
  let fireFireEarthDefenders: Hero[];
  let fireFireFireDefenders: Hero[];

  beforeEach(() => {
    arenaDamageCalculator = new ArenaDamageCalculator();
    // Water defenders
    defenderWaterHero = new HeroBuilder().withElement(HeroElement.Water).withLp(100).build();
    defenderWaterHeroBUFF = new HeroBuilder().withElement(HeroElement.Water).withLp(100).withBuff([Buff.Defense]).withDef(1800).build();

    // Fire defenders
    defenderFireHero1 = new HeroBuilder().withElement(HeroElement.Fire).withLp(90).build();
    defenderFireHero2 = new HeroBuilder().withElement(HeroElement.Fire).withLp(90).build();
    defenderFireHero3 = new HeroBuilder().withElement(HeroElement.Fire).withLp(90).build();

    // Earth defenders
    defenderEarthHero = new HeroBuilder().withElement(HeroElement.Earth).withLp(80).build();
    defenderEarthHero1800DEF = new HeroBuilder().withElement(HeroElement.Earth).withLp(80).withDef(1800).build();

    // Attackers
    attackerWaterHero = new HeroBuilder().withElement(HeroElement.Water).withLp(100).withPow(10).build();
    attackerWaterHeroCRTR = new HeroBuilder().withElement(HeroElement.Water).withLp(100).withPow(10).withCrtr(100).build();
    attackerWaterHeroBUFF = new HeroBuilder().withElement(HeroElement.Water).withLp(100).withPow(10).withBuff([Buff.Attack]).withCrtr(100).build();
    attackerFireHeroCRTRandLETH = new HeroBuilder().withElement(HeroElement.Fire).withLp(100).withPow(10).withCrtr(100).withLeth(1000).build();
    attackerEarthHero = new HeroBuilder().withElement(HeroElement.Earth).withLp(100).withPow(5).build();
    attackerEarthHeroNEGATIVE = new HeroBuilder().withElement(HeroElement.Earth).withLp(100).withPow(-5).build();

    // Teams
    waterFireEarthDefenders = [defenderWaterHero, defenderFireHero1, defenderEarthHero];
    fireFireEarthDefenders = [defenderFireHero1, defenderFireHero2, defenderEarthHero];
    fireFireFireDefenders = [defenderFireHero1, defenderFireHero2, defenderFireHero3];

  });

  // TODO : change the xit to it once the code is ready
  xit("should return intact defenders life when no defenders", () => {
    // ARRANGE
    const noDefender: Hero[] = [];

    // ACT
    const computeDamage = new ArenaDamageCalculator().computeDamage(new HeroBuilder().build(), noDefender);

    // ASSERT
    expect(computeDamage).toEqual([]);
  });

  it("should return intact defenders life when attacker has 0 LP", () => {
    // ARRANGE
    const defenders = [defenderWaterHero, defenderFireHero1, defenderEarthHero];
    const diedEarthHero = new HeroBuilder().build();
    
    // ACT
    const computeDamage = arenaDamageCalculator.computeDamage(diedEarthHero, defenders);

    // ASSERT
    expect(computeDamage[0].lp).toBe(100);
    expect(computeDamage[1].lp).toBe(90);
    expect(computeDamage[2].lp).toBe(80);
  });

  // TODO : change the xit to it once the code is ready
  xit("should return died defenders when defenders has 0 LP", () => {
    // ARRANGE
    const diedWaterDefender = new HeroBuilder().build();
    const diedFireDefender = new HeroBuilder().withElement(HeroElement.Fire).build();
    const diedEarthDefender = new HeroBuilder().withElement(HeroElement.Earth).build();
    const diedDefenders = [diedWaterDefender, diedFireDefender, diedEarthDefender];
    
    // ACT
    const computeDamage = arenaDamageCalculator.computeDamage(attackerEarthHero, diedDefenders);

    // ASSERT
    expect(computeDamage[0].lp).toBe(0);
    expect(computeDamage[1].lp).toBe(0);
    expect(computeDamage[2].lp).toBe(0);
  });

  it("should return intact defenders life when attacker has negative POW", () => {
    // ARRANGE
    const defenders = [defenderWaterHero, defenderFireHero1, defenderEarthHero];
    
    // ACT
    const computeDamage = arenaDamageCalculator.computeDamage(attackerEarthHeroNEGATIVE, defenders);

    // ASSERT
    expect(computeDamage[0].lp).toBe(100);
    expect(computeDamage[1].lp).toBe(90);
    expect(computeDamage[2].lp).toBe(80);
  });

  it("should attack the defender with the weakest type against the attacker and not the other elements", () => {
    // ARRANGE

    // ACT
    const computeDamage = arenaDamageCalculator.computeDamage(attackerEarthHero, waterFireEarthDefenders);

    // ASSERT
    // Water defender (weak type)
    expect(computeDamage[0].lp).toBeLessThan(100);
    // Fire defender
    expect(computeDamage[1].lp).toBe(90);
    // Earth defender
    expect(computeDamage[2].lp).toBe(80);
  });

  it("should attack the hero of the weak type against the attacker with a 20% damage bonus", () => {
    // ARRANGE

    // ACT
    const computeDamage = arenaDamageCalculator.computeDamage(attackerEarthHero, [defenderWaterHero]);

    // ASSERT
    expect(computeDamage[0].lp).toBe(94);
  });

  it("should attack the hero of the same type against the attacker if no weak type is in front", () => {
    // ARRANGE

    // ACT
    const computeDamage = arenaDamageCalculator.computeDamage(attackerEarthHero, fireFireEarthDefenders);

    // ASSERT
    expect(computeDamage[0].lp).toBe(90);
    expect(computeDamage[1].lp).toBe(90);
    expect(computeDamage[2].lp).toBeLessThan(80);
  });

  it("should attack the hero of the same type against the attacker without damage bonus", () => {
    // ARRANGE

    // ACT
    const computeDamage = arenaDamageCalculator.computeDamage(attackerEarthHero, [defenderEarthHero]);

    // ASSERT
    expect(computeDamage[0].lp).toBe(75);
  });


  it("should attack one of the heroes with a strong type against the attacker if no other type is in front", () => {
    // ARRANGE

    // ACT
    const computeDamage = arenaDamageCalculator.computeDamage(attackerEarthHero, fireFireFireDefenders);

    // ASSERT
    expect(computeDamage[0].lp).toBeLessThanOrEqual(90);
    expect(computeDamage[1].lp).toBeLessThanOrEqual(90);
    expect(computeDamage[2].lp).toBeLessThanOrEqual(90);
  });

  it("should attack the hero of the strong type against the attacker with a damage malus (-20%)", () => {
    // ARRANGE

    // ACT
    const computeDamage = arenaDamageCalculator.computeDamage(attackerEarthHero, [defenderFireHero1]);

    // ASSERT
    expect(computeDamage[0].lp).toBe(86);
  });
  
  it("should decrease damage by 1% for every 75 defense points (rounded down to the nearest unit)", () => {
    // ARRANGE

    // ACT
    const computeDamage = arenaDamageCalculator.computeDamage(attackerEarthHero, [defenderEarthHero1800DEF]);


    // ASSERT
    expect(computeDamage[0].lp).toBe(77);
  })


  it("CRTR should increase damage by 50% without LETH", () => {
    // ARRANGE

    // ACT
    const computeDamage = arenaDamageCalculator.computeDamage(attackerWaterHeroCRTR, [defenderWaterHero]);

    // ASSERT
    expect(computeDamage[0].lp).toBe(85);
  })

  it("LETH should increase the damage even more with a critical hit", () => {
    // ARRANGE

    // ACT
    const computeDamage = arenaDamageCalculator.computeDamage(attackerFireHeroCRTRandLETH, [defenderFireHero1]);

    // ASSERT
    expect(computeDamage[0].lp).toBe(73);
  });

  it("a defender with a defense buff should take less damage", () => {
    // ARRANGE

    // ACT
    const computeDamage = arenaDamageCalculator.computeDamage(attackerWaterHero, [defenderWaterHeroBUFF]);

    // ASSERT
    expect(computeDamage[0].lp).toBe(95);
  });


  it("a attacker with a attack buff should take more damage", () => {
    // ARRANGE

    // ACT
    const computeDamage = arenaDamageCalculator.computeDamage(attackerWaterHeroBUFF, [defenderEarthHero1800DEF]);

    // ASSERT
    expect(computeDamage[0].lp).toBe(69);
  });
});