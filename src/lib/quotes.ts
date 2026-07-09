const QUOTES: string[] = [
  "Discipline is choosing between what you want now and what you want most.",
  "Motivation gets you started. Discipline keeps you going.",
  "You don't have to be great to start, but you have to start to be great.",
  "The pain of discipline weighs ounces; the pain of regret weighs tons.",
  "Show up on the days you don't feel like it — that's the whole game.",
  "Small consistent reps beat occasional heroics.",
  "Your future self is built by what you do today, not what you plan to do tomorrow.",
  "Nobody who ever gave their best effort regretted it.",
  "The body achieves what the mind believes.",
  "Consistency turns average into elite.",
  "You won't always be motivated, so you have to be disciplined.",
  "Champions keep playing until they get it right.",
  "The only bad workout is the one that didn't happen.",
  "Progress, not perfection.",
  "Do something today that your future self will thank you for.",
  "It never gets easier, you just get stronger.",
  "The gap between where you are and where you want to be is called effort.",
  "One more rep. One more day. One more win.",
  "Excuses don't burn calories.",
  "Discipline is the bridge between goals and accomplishment.",
  "You are what you repeatedly do.",
  "Hard days build the person who handles easy days well.",
  "The best project you'll ever work on is you.",
  "Success is the sum of small efforts repeated daily.",
  "Don't wish it were easier, wish you were better.",
  "Every session is a deposit into the account you'll withdraw from later.",
  "Suffer the discipline of training or suffer the regret of not training.",
  "Strength doesn't come from what you can do — it comes from overcoming what you thought you couldn't.",
  "Stay patient. Stay hungry. Stay consistent.",
  "The comeback is always stronger than the setback.",
];

/** Deterministic per-day quote — same quote all day, rotates daily. */
export function getDailyQuote(date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}
