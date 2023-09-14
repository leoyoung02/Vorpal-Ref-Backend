export type race = "Humans" | "Lizards" | "Insects" | "Waters"

export type raceList = {
    humans: race,
    lizrds: race,
    insects: race,
    waters: race
}

export const races : raceList = {
    humans: "Humans",
    lizrds: "Lizards",
    insects: "Insects",
    waters: "Waters"
}

export const userActionList = {
  slowDown: "slowDown",
  ultimate: "ultimate",
  rocketShot: "rocketshot",
  planetshot: "planetshot",
}

export const storeUnits = {
    QuantumDisruptor: "QuantumDisruptor",
    PhaseFluxGenerator: "PhaseFluxGenerator",
    QuantumPrecisionEnhancer: "QuantumPrecisionEnhancer",
    TemporalInhibitor: "TemporalInhibitor",
    HyperDriveCatalyst: "HyperDriveCatalyst",
    VelocityBooster: "VelocityBooster",
    ChronoDisruptor: "ChronoDisruptor",
    VorpalCore: "VorpalCore"
}