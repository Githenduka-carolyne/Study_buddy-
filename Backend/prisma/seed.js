import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a test user
    const plainPassword = 'password123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log('Generated hash for password:', hashedPassword);

    const testUser = await prisma.users.create({
      data: {
        name: 'Samuel Test',
        emailAddress: 'samuel@gmail.com',
        password: hashedPassword,
        phoneNumber: null
      }
    });

    console.log('Created test user:', {
      id: testUser.id,
      name: testUser.name,
      email: testUser.emailAddress,
      passwordHash: testUser.password
    });

    // Create some sample activities
    const webDevelopment = await prisma.activities.create({
      data: {
        title: 'Web Development Fundamentals',
        description: 'Learn the basics of web development including HTML, CSS, and JavaScript',
        subtopics: {
          create: [
            {
              title: 'HTML Basics',
              content: `
# HTML Basics

HTML (HyperText Markup Language) is the standard markup language for creating web pages. Here are the key concepts:

## Document Structure
- \`<!DOCTYPE html>\`: Declares the document type
- \`<html>\`: Root element
- \`<head>\`: Contains metadata
- \`<body>\`: Contains visible content

## Common Elements
- Headings: \`<h1>\` to \`<h6>\`
- Paragraphs: \`<p>\`
- Links: \`<a href="...">\`
- Images: \`<img src="...">\`
- Lists: \`<ul>\`, \`<ol>\`, \`<li>\`

## Practice Exercise
Create a simple webpage with:
1. A main heading
2. Two paragraphs
3. An image
4. A list of your favorite websites
              `,
              order: 1
            },
            {
              title: 'CSS Fundamentals',
              content: `
# CSS Fundamentals

CSS (Cascading Style Sheets) is used to style HTML elements. Here are the basics:

## Selectors
- Element selectors: \`p { ... }\`
- Class selectors: \`.class-name { ... }\`
- ID selectors: \`#id-name { ... }\`

## Properties
- Colors: \`color\`, \`background-color\`
- Typography: \`font-size\`, \`font-family\`
- Layout: \`margin\`, \`padding\`, \`border\`

## Practice Exercise
Style your HTML page with:
1. Different colors for headings and paragraphs
2. Custom fonts
3. Margins and padding
4. Borders around elements
              `,
              order: 2
            },
            {
              title: 'JavaScript Basics',
              content: `
# JavaScript Basics

JavaScript is a programming language that makes web pages interactive.

## Variables and Data Types
\`\`\`javascript
let name = 'John';           // String
const age = 25;             // Number
let isStudent = true;       // Boolean
let hobbies = ['reading', 'coding']; // Array
\`\`\`

## Functions
\`\`\`javascript
function greet(name) {
    return 'Hello, ' + name + '!';
}
\`\`\`

## Practice Exercise
Create a simple calculator that can:
1. Add two numbers
2. Subtract two numbers
3. Multiply two numbers
4. Divide two numbers
              `,
              order: 3
            }
          ]
        }
      }
    });

    const pythonProgramming = await prisma.activities.create({
      data: {
        title: 'Python Programming',
        description: 'Master Python programming from basics to advanced concepts',
        subtopics: {
          create: [
            {
              title: 'Python Basics',
              content: `
# Python Basics

Python is a high-level programming language known for its simplicity and readability.

## Variables and Data Types
\`\`\`python
name = "Alice"    # String
age = 25         # Integer
height = 1.75    # Float
is_student = True # Boolean
\`\`\`

## Control Flow
\`\`\`python
if age >= 18:
    print("Adult")
else:
    print("Minor")
\`\`\`

## Practice Exercise
Write a program that:
1. Takes user input for name and age
2. Prints a personalized greeting
3. Determines if the person is an adult or minor
              `,
              order: 1
            },
            {
              title: 'Python Functions',
              content: `
# Python Functions

Functions are reusable blocks of code that perform specific tasks.

## Function Definition
\`\`\`python
def greet(name):
    return f"Hello, {name}!"

def calculate_area(length, width):
    return length * width
\`\`\`

## Practice Exercise
Create functions to:
1. Calculate the area of a circle
2. Convert temperature between Celsius and Fahrenheit
3. Find the maximum of three numbers
              `,
              order: 2
            }
          ]
        }
      }
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
