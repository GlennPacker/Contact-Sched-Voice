function getEnvRates() {
  return {
    rateFullDay: +(process.env.NEXT_PUBLIC_RATE_FULL_DAY ?? 0),
    rateHalfDay: +(process.env.NEXT_PUBLIC_RATE_HALF_DAY ?? 0),
    rateTwoHour: +(process.env.NEXT_PUBLIC_RATE_TWO_HOUR ?? 0),
    rateHour: +(process.env.NEXT_PUBLIC_RATE_HOUR ?? 0),
    rateJob: +(process.env.NEXT_PUBLIC_RATE_JOB ?? 0),
  }
}

export { getEnvRates }
