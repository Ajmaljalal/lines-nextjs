
const styles = {
  container: `
  w-full
  flex
  flex-col
  items-center
  gap-6
  overflow-y-auto
  pt-40
  pb-20
  `,

  title: `
  text-4xl
  font-semibold
  text-zinc-200`,

  subtitle: `
  text-zinc-400
  text-center`,

  examplesSection: `
  w-full
  max-w-2xl
  mt-4`,

  exampleQuery: `
  bg-zinc-800 
  hover:bg-zinc-700 
  transition-colors 
  p-4 
  rounded-lg 
  cursor-pointer 
  flex 
  items-center 
  gap-3`,
};

const WelcomeMessage: React.FC<{ handleExampleClick: (query: string) => void }> = ({ handleExampleClick }) => {
  return (
    <>
      <h1 className={styles.title}>Welcome!</h1>
      <h3 className={styles.subtitle}>
        I am your assistant in generating beautifully designed emails & newsletters.
        <br />
        What would you like to write about?
      </h3>
      <div className={styles.examplesSection}>
        <div className="flex flex-col gap-3">
          <div
            className={styles.exampleQuery}
            onClick={() => handleExampleClick('Create a tech newsletter about AI and machine learning developments')}
          >
            <span className="text-zinc-300">💡</span>
            <span>Create a tech newsletter about AI and machine learning developments</span>
          </div>
          <div
            className={styles.exampleQuery}
            onClick={() => handleExampleClick('Generate a weekly summary newsletter on climate change news')}
          >
            <span className="text-zinc-300">💡</span>
            <span>Generate a weekly summary newsletter on climate change news</span>
          </div>
          <div
            className={styles.exampleQuery}
            onClick={() => handleExampleClick('Make a newsletter about startup funding rounds for this week')}
          >
            <span className="text-zinc-300">💡</span>
            <span>Make a newsletter about startup funding rounds for this week</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default WelcomeMessage;