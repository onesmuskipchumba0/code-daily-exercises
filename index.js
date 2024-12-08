#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Command } = require('commander');
const inquirer = require('inquirer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs').promises;
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const figlet = require('figlet');

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
    fileTemplates: {
      Frontend: {
        files: [
          { name: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Exercise</title>\n    <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n    <div id="app"></div>\n    <script src="script.js"></script>\n</body>\n</html>' },
          { name: 'styles.css', content: '/* Add your styles here */\n' },
          { name: 'script.js', content: '// Add your JavaScript code here\n' }
        ]
      },
      Backend: {
        files: [
          { name: 'server.js', content: 'const express = require(\'express\');\nconst app = express();\n\napp.use(express.json());\n\n// Add your routes here\n\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => console.log(`Server running on port ${PORT}`));' },
          { name: 'package.json', content: '{\n  "name": "exercise",\n  "version": "1.0.0",\n  "main": "server.js",\n  "dependencies": {\n    "express": "^4.17.1"\n  }\n}' }
        ]
      },
      Fullstack: {
        files: [
          { name: 'frontend/index.html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Exercise</title>\n    <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n    <div id="app"></div>\n    <script src="script.js"></script>\n</body>\n</html>' },
          { name: 'frontend/styles.css', content: '/* Add your styles here */\n' },
          { name: 'frontend/script.js', content: '// Add your JavaScript code here\n' },
          { name: 'backend/server.js', content: 'const express = require(\'express\');\nconst app = express();\n\napp.use(express.json());\n\n// Add your routes here\n\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => console.log(`Server running on port ${PORT}`));' }
        ]
      }
    }
  },
  python: {
    name: 'Python',
    sections: ['Backend', 'Data Science', 'Algorithms', 'Machine Learning', 'Web Development'],
    fileTemplates: {
      Backend: {
        files: [
          { name: 'app.py', content: 'from flask import Flask\n\napp = Flask(__name__)\n\n@app.route("/")\ndef hello():\n    return "Hello, World!"\n\nif __name__ == "__main__":\n    app.run(debug=True)' },
          { name: 'requirements.txt', content: 'flask==2.0.1\n' }
        ]
      },
      'Data Science': {
        files: [
          { name: 'analysis.py', content: 'import pandas as pd\nimport numpy as np\n\n# Add your data analysis code here\n' },
          { name: 'requirements.txt', content: 'pandas==1.3.3\nnumpy==1.21.2\n' }
        ]
      },
      'Machine Learning': {
        files: [
          { name: 'model.py', content: 'import tensorflow as tf\nimport numpy as np\n\n# Add your ML model code here\n' },
          { name: 'requirements.txt', content: 'tensorflow==2.7.0\nnumpy==1.21.2\n' }
        ]
      }
    }
  },
  typescript: {
    name: 'TypeScript',
    sections: ['Frontend', 'Backend', 'Fullstack', 'React', 'Node.js'],
    fileTemplates: {
      Frontend: {
        files: [
          { name: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Exercise</title>\n    <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n    <div id="app"></div>\n    <script src="dist/script.js"></script>\n</body>\n</html>' },
          { name: 'src/script.ts', content: '// Add your TypeScript code here\n' },
          { name: 'styles.css', content: '/* Add your styles here */\n' },
          { name: 'tsconfig.json', content: '{\n  "compilerOptions": {\n    "target": "es5",\n    "module": "commonjs",\n    "outDir": "./dist",\n    "strict": true,\n    "esModuleInterop": true,\n    "skipLibCheck": true,\n    "forceConsistentCasingInFileNames": true\n  }\n}' }
        ]
      }
    }
  },
  rust: {
    name: 'Rust',
    sections: ['CLI', 'Web Server', 'Systems Programming', 'Data Structures', 'Algorithms'],
    fileTemplates: {
      CLI: {
        files: [
          { name: 'Cargo.toml', content: '[package]\nname = "exercise"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\nclap = "3.0"\n' },
          { name: 'src/main.rs', content: 'fn main() {\n    println!("Hello, world!");\n}\n' }
        ]
      }
    }
  },
  go: {
    name: 'Go',
    sections: ['Backend', 'CLI', 'Web Services', 'Data Structures', 'Algorithms'],
    fileTemplates: {
      Backend: {
        files: [
          { name: 'main.go', content: 'package main\n\nimport (\n\t"fmt"\n\t"net/http"\n)\n\nfunc main() {\n\thttp.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {\n\t\tfmt.Fprintf(w, "Hello, World!")\n\t})\n\n\tfmt.Println("Server starting on :8080")\n\thttp.ListenAndServe(":8080", nil)\n}\n' },
          { name: 'go.mod', content: 'module exercise\n\ngo 1.17\n' }
        ]
      }
    }
  }
};

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateExercises(language, section) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Generate 5 coding exercises for ${language} focusing on ${section}. 
    Format each exercise in markdown as follows:
    # Exercise N
    ## Title
    [exercise title]
    
    ## Difficulty
    [Easy/Medium/Hard]
    
    ## Description
    [detailed problem description]
    
    ## Requirements
    - [requirement 1]
    - [requirement 2]
    
    ## Example Input/Output (if applicable)
    \`\`\`
    [example]
    \`\`\`
    
    Make the exercises practical and realistic, suitable for a developer learning ${language} with focus on ${section}.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(chalk.red('Error generating exercises:', error.message));
    throw error;
  }
}

async function generateAnswer(exercise, language) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Generate a detailed solution for the following ${language} exercise:
    ${exercise}
    
    Format your response in markdown as follows:
    # Solution
    
    ## Explanation
    [Step-by-step explanation]
    
    ## Code Solution
    \`\`\`${language.toLowerCase()}
    [complete code solution]
    \`\`\`
    
    ## Key Points
    - [important consideration 1]
    - [important consideration 2]
    
    ## Alternative Approaches
    [if applicable, describe other ways to solve the problem]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(chalk.red('Error generating answer:', error.message));
    throw error;
  }
}

async function createExerciseFiles(language, section, exercises) {
  const dateStr = new Date().toISOString().split('T')[0];
  const folderName = `${language.toLowerCase()}-${section.toLowerCase()}-${dateStr}`;
  const folderPath = path.join(process.cwd(), folderName);

  try {
    // Create main exercise folder
    await fs.mkdir(folderPath, { recursive: true });
    
    // Create exercises.md
    await fs.writeFile(
      path.join(folderPath, 'exercises.md'),
      exercises
    );

    // Create language-specific files
    const templates = languageOptions[language.toLowerCase()]?.fileTemplates?.[section];
    if (templates) {
      for (const file of templates.files) {
        const filePath = path.join(folderPath, file.name);
        // Create directories if the file is in a subdirectory
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, file.content);
      }
      console.log(chalk.green(`\nCreated template files for ${language} ${section} project`));
    }
    
    console.log(chalk.green(`\nCreated exercise folder: ${folderName}`));
    console.log(chalk.green('Exercises saved in exercises.md'));
    
    // Create numbered exercise folders
    for (let i = 1; i <= 5; i++) {
      const exercisePath = path.join(folderPath, `exercise-${i}`);
      await fs.mkdir(exercisePath, { recursive: true });
      
      // Copy template files to each exercise folder if templates exist
      if (templates) {
        for (const file of templates.files) {
          const filePath = path.join(exercisePath, file.name);
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, file.content);
        }
      }
    }

    // Render the markdown in the terminal
    console.log('\n' + formatMarkdown(exercises));
    
  } catch (error) {
    console.error(chalk.red('Error creating exercise files:', error.message));
    throw error;
  }
}

async function main() {
  try {
    // Display banner
    console.log(banner);

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

      const { wantAnswer } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'wantAnswer',
          message: 'Would you like to see the solution for any exercise?',
          default: false
        }
      ]);

      if (wantAnswer) {
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
