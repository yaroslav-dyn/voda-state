export function getTimeOfDay() {
  const hour = new Date().getHours()
  
  if (hour >= 6 && hour < 12) {
    return 'morning'
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon'
  } else if (hour >= 18 && hour < 22) {
    return 'evening'
  } else {
    return 'night'
  }
}

export function getTimeBasedGreeting() {
  const timeOfDay = getTimeOfDay()
  
  const greetings = {
    morning: 'Good morning! Ready to start your day with focus?',
    afternoon: 'Good afternoon! Time to dive into productive work!',
    evening: 'Good evening! Let\'s finish the day strong!',
    night: 'Working late? Stay hydrated and focused!'
  }
  
  return greetings[timeOfDay]
}

export function formatTimeRemaining(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  return {
    minutes: minutes.toString().padStart(2, '0'),
    seconds: remainingSeconds.toString().padStart(2, '0'),
    formatted: `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

export function getSessionDuration(startTime, endTime) {
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  return Math.floor((end - start) / 1000)
}

export function isToday(date) {
  const today = new Date()
  const checkDate = new Date(date)
  
  return today.toDateString() === checkDate.toDateString()
}

export function isThisWeek(date) {
  const today = new Date()
  const checkDate = new Date(date)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(today.getDate() - 7)
  
  return checkDate >= oneWeekAgo && checkDate <= today
}

export function getDaysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000
  const firstDate = new Date(date1)
  const secondDate = new Date(date2)
  
  return Math.round(Math.abs((firstDate - secondDate) / oneDay))
}
