#!/usr/bin/env node

const path = require('path');
const { Command } = require('commander');
const inquirer = require('inquirer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs').promises;
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const figlet = require('figlet');
const dotenv = require('dotenv');

const program = new Command();

// ASCII Art Banner
const banner = `
${chalk.cyan(figlet.textSync('Code Daily', {
  font: 'Standard',
  horizontalLayout: 'full'
}))}

${chalk.yellow('🚀 Daily Coding Exercise Generator')}
${chalk.gray('───────────────────────────────────')}

${chalk.white('Author:')} ${chalk.green('Onesmus Bett')}
${chalk.white('GitHub:')} ${chalk.blue('https://github.com/onesmuskipchumba0')}
${chalk.white('Email:')}  ${chalk.blue('onesmuskipchumba5@gmail.com')}

${chalk.gray('───────────────────────────────────')}
`;

// Helper function to format markdown output
function formatMarkdown(text) {
  const html = md.render(text);
  // Simple HTML to terminal formatting
  return html
    .replace(/<h1.*?>(.*?)<\/h1>/g, chalk.bold.underline.green('\n$1\n'))
    .replace(/<h2.*?>(.*?)<\/h2>/g, chalk.bold.yellow('\n$1\n'))
    .replace(/<h3.*?>(.*?)<\/h3>/g, chalk.bold.cyan('\n$1\n'))
    .replace(/<code>(.*?)<\/code>/g, chalk.yellow('$1'))
    .replace(/<pre><code.*?>(.*?)<\/code><\/pre>/gs, (_, code) => chalk.yellow('\n' + code.trim() + '\n'))
    .replace(/<ul>(.*?)<\/ul>/gs, '$1')
    .replace(/<li>(.*?)<\/li>/g, '  • $1')
    .replace(/<p>(.*?)<\/p>/g, '\n$1\n')
    .replace(/<em>(.*?)<\/em>/g, chalk.italic('$1'))
    .replace(/<strong>(.*?)<\/strong>/g, chalk.bold('$1'))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
    .trim();
}

const languageOptions = {
  javascript: {
    name: 'JavaScript',
    sections: ['Frontend', 'Backend', 'Fullstack', 'Data Structures', 'Algorithms'],
    template: '// Add your JavaScript code here\n',
    filename: 'script.js'
  },
  python: {
    name: 'Python',
    sections: ['Backend', 'Data Science', 'Algorithms', 'Machine Learning', 'Web Development'],
    template: '# Add your Python code here\n',
    filename: 'script.py'
  },
  typescript: {
    name: 'TypeScript',
    sections: ['Frontend', 'Backend', 'Fullstack', 'React', 'Node.js'],
    template: '// Add your TypeScript code here\n',
    filename: 'script.ts'
  },
  rust: {
    name: 'Rust',
    sections: ['CLI', 'Web Server', 'Systems Programming', 'Data Structures', 'Algorithms'],
    template: '// Add your Rust code here\n',
    filename: 'main.rs'
  },
  go: {
    name: 'Go',
    sections: ['Backend', 'CLI', 'Web Services', 'Data Structures', 'Algorithms'],
    template: '// Add your Go code here\n',
    filename: 'main.go'
  }
};

// Function to validate API key
async function validateApiKey(apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    await model.generateContent("test");
    return true;
  } catch (error) {
    console.log(chalk.red('API Key validation error:', error.message));
    return false;
  }
}

// Function to get valid API key
async function getValidApiKey() {
  while (true) {
    const { apiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Please enter your Gemini API key:',
        validate: input => input.length > 0 ? true : 'API key is required'
      }
    ]);

    console.log(chalk.yellow('\nValidating API key...'));
    if (await validateApiKey(apiKey)) {
      return apiKey;
    }
    console.log(chalk.red('Invalid API key. Please try again.'));
  }
}

// Function to check and setup API key
async function checkAndSetupApiKey() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    let apiKey;

    // Try to load existing .env file
    try {
      const envConfig = dotenv.config({ path: envPath });
      
      if (envConfig.error) {
        throw new Error('No .env file');
      }

      apiKey = process.env.GEMINI_API_KEY;
      console.log(chalk.blue('Current API Key:', apiKey ? '****' + apiKey.slice(-4) : 'not found'));

      // Validate existing API key
      if (!apiKey || !(await validateApiKey(apiKey))) {
        console.log(chalk.yellow('\nInvalid or missing API key. Let\'s set it up!\n'));
        apiKey = await getValidApiKey();
        await fs.writeFile(envPath, `GEMINI_API_KEY=${apiKey}`);
        process.env.GEMINI_API_KEY = apiKey;
        console.log(chalk.green('\nAPI key saved successfully!\n'));
      } else {
        console.log(chalk.green('API key validated successfully!'));
      }
    } catch (error) {
      console.log(chalk.yellow('\nNo .env file found. Let\'s set it up!\n'));
      apiKey = await getValidApiKey();
      await fs.writeFile(envPath, `GEMINI_API_KEY=${apiKey}`);
      process.env.GEMINI_API_KEY = apiKey;
      console.log(chalk.green('\nAPI key saved successfully!\n'));
    }

    // Double check that we have a valid key before proceeding
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('API key not set after setup');
    }

    // Initialize Gemini AI with the validated key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  } catch (error) {
    console.error(chalk.red('Error setting up API key:', error.message));
    process.exit(1);
  }
}

async function generateExercises(language, section) {
  const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Generate 5 coding exercises for ${language} focusing on ${section}. 
    Format each exercise in markdown as follows:
    
    # Exercise [number]
    
    ## Problem Description
    [A clear description of the problem]
    
    ## Requirements
    - [Requirement 1]
    - [Requirement 2]
    - [Additional requirements]
    
    ## Example
    [Input/Output example or usage example]
    
    ## Notes
    [Any additional notes, hints, or constraints]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(chalk.red('Error generating exercises:', error.message));
    throw error;
  }
}

async function createExerciseFiles(language, section, exercises) {
  try {
    // Create main directory with date
    const date = new Date().toISOString().split('T')[0];
    const dirName = `${language.toLowerCase()}-${section.toLowerCase()}-${date}`;
    const dirPath = path.join(process.cwd(), dirName);
    await fs.mkdir(dirPath, { recursive: true });

    // Write exercises to file
    const exercisePath = path.join(dirPath, 'exercises.md');
    await fs.writeFile(exercisePath, exercises);

    // Create template files based on language
    if (languageOptions[language] && languageOptions[language].template) {
      for (let i = 1; i <= 5; i++) {
        const exerciseDirPath = path.join(dirPath, `exercise-${i}`);
        await fs.mkdir(exerciseDirPath, { recursive: true });
        
        const templateContent = languageOptions[language].template;
        const templatePath = path.join(exerciseDirPath, languageOptions[language].filename);
        await fs.writeFile(templatePath, templateContent);
      }
    }

    console.log(chalk.green(`\nExercises saved to: ${dirName}/exercises.md`));
  } catch (error) {
    console.error(chalk.red('Error creating exercise files:', error.message));
    throw error;
  }
}

async function generateAnswer(exercise, language) {
  const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Generate a detailed solution for the following ${language} exercise:
    ${exercise}
    
    Format your response in markdown with:
    1. Solution explanation
    2. Complete code with comments
    3. Example usage or test cases`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(chalk.red('Error generating answer:', error.message));
    throw error;
  }
}

async function main() {
  try {
    // Display banner
    console.log(banner);

    // Check and setup API key before proceeding
    await checkAndSetupApiKey();

    while (true) {
      // Get language selection
      const { language } = await inquirer.prompt([
        {
          type: 'list',
          name: 'language',
          message: 'Choose a programming language:',
          choices: [
            ...Object.keys(languageOptions).map(lang => ({
              name: languageOptions[lang].name,
              value: lang
            })),
            { name: 'Exit', value: 'exit' }
          ]
        }
      ]);

      if (language === 'exit') {
        console.log(chalk.yellow('\nThank you for using Code Daily! Happy coding! 👋'));
        process.exit(0);
      }

      // Get section selection
      const { section } = await inquirer.prompt([
        {
          type: 'list',
          name: 'section',
          message: 'Choose a section:',
          choices: languageOptions[language].sections
        }
      ]);

      const spinner = ora('Generating exercises...').start();
      const exercises = await generateExercises(language, section);
      spinner.succeed('Exercises generated!');

      await createExerciseFiles(language, section, exercises);

      let viewingSolutions = true;
      while (viewingSolutions) {
        const { wantAnswer } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'wantAnswer',
            message: 'Would you like to see a solution for any exercise?',
            default: false
          }
        ]);

        if (!wantAnswer) {
          viewingSolutions = false;
          break;
        }

        const { exerciseNumber } = await inquirer.prompt([
          {
            type: 'input',
            name: 'exerciseNumber',
            message: 'Enter the exercise number (1-5):',
            validate: input => {
              const num = parseInt(input);
              return num >= 1 && num <= 5 ? true : 'Please enter a number between 1 and 5';
            }
          }
        ]);

        const spinner = ora('Generating solution...').start();
        const answer = await generateAnswer(exercises.split('Exercise ' + exerciseNumber)[1].split('Exercise')[0], language);
        spinner.succeed('Solution generated!');

        const answerPath = path.join(process.cwd(), `${language.toLowerCase()}-${section.toLowerCase()}-${new Date().toISOString().split('T')[0]}`, `solution-${exerciseNumber}.md`);
        await fs.writeFile(answerPath, answer);
        
        console.log('\n' + chalk.yellow('Solution:'));
        console.log(formatMarkdown(answer));
        console.log(chalk.green(`\nSolution saved to: solution-${exerciseNumber}.md`));
      }

      // Ask if user wants to continue or exit
      const { continueUsing } = await inquirer.prompt([
        {
          type: 'list',
          name: 'continueUsing',
          message: 'What would you like to do next?',
          choices: [
            { name: 'Generate More Exercises', value: 'continue' },
            { name: 'Exit', value: 'exit' }
          ]
        }
      ]);

      if (continueUsing === 'exit') {
        console.log(chalk.yellow('\nThank you for using Code Daily! Happy coding! 👋'));
        process.exit(0);
      }

      // Add a visual separator between sessions
      console.log(chalk.gray('\n───────────────────────────────────\n'));
    }

  } catch (error) {
    console.error(chalk.red('An error occurred:', error.message));
    process.exit(1);
  }
}

program
  .name('code-daily')
  .description('Generate daily coding exercises using Gemini AI')
  .version('1.0.0')
  .action(main);

program.parse(process.argv);
