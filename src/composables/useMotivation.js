export function useMotivation() {
  const motivationalMessages = {
    welcome: [
      "Welcome to VodaState! Time to hydrate your productivity!",
      "Ready to dive into focused work? Let's fill that bottle!",
      "Your productivity journey begins with a single drop!"
    ],
    session_start: {
      work: [
        "Time to hydrate your productivity!",
        "Let the focus flow like a mighty river!",
        "Channel your inner water - calm, persistent, and powerful!",
        "Every drop counts! Let's make this session count!"
      ],
      break: [
        "Take a break and refresh yourself",
        "Like a gentle stream, let yourself rest and recharge",
        "Even rivers need calm pools - enjoy your break!",
        "Refresh your mind like morning dew"
      ]
    },
    session_complete: {
      work: [
        "Well done! You've stayed hydrated and focused!",
        "Another successful session! Your focus flows like water!",
        "Excellent work! You're building momentum like a flowing river!",
        "Session complete! Your productivity is crystal clear!"
      ],
      break: [
        "Break complete! Time to dive back into focused work!",
        "Refreshed and ready! Let's get back to the flow!",
        "Great break! Now let's channel that renewed energy!"
      ]
    },
    quarter_progress: [
      "Quarter way there! Your focus is starting to flow!",
      "25% complete! Keep the momentum flowing!",
      "Great start! Like a stream gathering strength!"
    ],
    half_progress: [
      "Halfway there! You're in the flow zone!",
      "50% complete! Your focus runs deep like an ocean!",
      "Excellent progress! Steady as a flowing river!"
    ],
    three_quarter_progress: [
      "Almost there! Your dedication flows strong!",
      "75% complete! The finish line is within reach!",
      "Final stretch! Your focus is unstoppable like a waterfall!"
    ],
    streak_messages: {
      3: "Three sessions in a row! Your focus is gaining momentum!",
      5: "Five sessions! You're flowing like a steady stream!",
      7: "A week of focus! You're as consistent as the tides!",
      14: "Two weeks strong! Your productivity flows like a mighty river!",
      30: "A month of dedication! You're as vast and deep as the ocean!"
    },
    daily_goals: [
      "You're on track to fill 5 bottles today!",
      "Every session brings you closer to your daily goal!",
      "Like drops in a bucket, each session matters!",
      "Your daily hydration goal is within reach!"
    ],
    achievements: [
      "Achievement unlocked! Your focus continues to flow!",
      "New milestone reached! Like water, you persist and succeed!",
      "Congratulations! Your dedication runs as deep as the ocean!"
    ],
    tips: [
      "💧 Tip: Stay physically hydrated too! Water helps with focus.",
      "🌊 Tip: Like water finding its path, let your focus flow naturally.",
      "💪 Tip: Consistency beats intensity - small streams carve grand canyons!",
      "🎯 Tip: Set intentions before each session, like directing a river's flow.",
      "🌱 Tip: Growth happens drop by drop, session by session.",
      "⚡ Tip: Take breaks seriously - even waterfalls need pools to gather strength."
    ]
  }

  const getMessage = (type, context = null) => {
    let messages = []

    switch (type) {
      case 'welcome':
        messages = motivationalMessages.welcome
        break
      case 'session_start':
        messages = motivationalMessages.session_start[context] || motivationalMessages.session_start.work
        break
      case 'session_complete':
        messages = motivationalMessages.session_complete[context] || motivationalMessages.session_complete.work
        break
      case 'quarter_progress':
        messages = motivationalMessages.quarter_progress
        break
      case 'half_progress':
        messages = motivationalMessages.half_progress
        break
      case 'three_quarter_progress':
        messages = motivationalMessages.three_quarter_progress
        break
      case 'daily_goal':
        messages = motivationalMessages.daily_goals
        break
      case 'tip':
        messages = motivationalMessages.tips
        break
      case 'streak':
        return motivationalMessages.streak_messages[context] || "Keep the streak flowing!"
      default:
        messages = ["Stay focused and hydrated!"]
    }

    return messages[Math.floor(Math.random() * messages.length)]
  }

  const getRandomTip = () => {
    return getMessage('tip')
  }

  const getStreakMessage = (streakCount) => {
    return getMessage('streak', streakCount)
  }

  const getProgressMessage = (percentage) => {
    if (percentage >= 75) return getMessage('three_quarter_progress')
    if (percentage >= 50) return getMessage('half_progress')
    if (percentage >= 25) return getMessage('quarter_progress')
    return "Keep going! Every drop counts!"
  }

  return {
    getMessage,
    getRandomTip,
    getStreakMessage,
    getProgressMessage
  }
}
