export function epilogueAccounts(flags: readonly string[]): Record<string, string> {
  return {
    mara: "I signed an order I did not understand. The public report names my part in it. Responsibility means people can question my next decision before they have to live with it.",
    iven:
      flags.includes("open-passage") || flags.includes("ari-trusted")
        ? "Eni's ship has room for a route-reader. I am going. The garden will have another door by the time I come back; someone had better send me a map."
        : "I am staying through the next maintenance season. After that, I want to see the routes Eni keeps writing about. Staying is easier when leaving is possible.",
    sela:
      flags.includes("private-records") || flags.includes("private-passengers")
        ? "The passage office keeps its records with the people they describe. We can prove a journey was voluntary without making every private reason public."
        : "We have an independent passage office now. The queue goes both ways. Nobody has to demonstrate gratitude to get through it.",
    tarn: flags.includes("shared-repair")
      ? "Vale is in the workshop. We disagree about the brackets. It is an ordinary, useful disagreement, and every measurement is on the wall where anyone can read it."
      : "The neighborhood crews each have a copy of the repair procedures. There is no master switch. If someone wants control, they will have to persuade people.",
    nera:
      flags.includes("nera-speaks") || flags.includes("mercy")
        ? "I have sent my testimony to the fleet. Other retrieval crews are asking for the records. I cannot promise reform. I can name the order I refused, and the orders I should have refused sooner."
        : "I will remain for the public inquiry. People who lived through custody are entitled to ask me questions I do not want to answer. After that, I will decide where I can be useful.",
  };
}
