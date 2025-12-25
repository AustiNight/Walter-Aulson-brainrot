
import { QuestionPack } from './types.ts';

export const PROFANITY_LIST = [
  'badword1', 'badword2', 'violence', 'gore', 'weapon', 'drug', 'sexy', 'nude', 'kill', 'death', 'blood', 'hate'
];

export const BRAINROT_LOADER_CHARS = [
  { name: "Tralalero Tralala", icon: "🦈👟", desc: "A three-legged shark in sneakers running at high speed" },
  { name: "Chimpanzini Bananini", icon: "🐵🍌", desc: "An indestructible chimp with a banana body" },
  { name: "Ballerina Cappuccina", icon: "☕💃", desc: "A graceful ballerina with a cappuccino cup for a head" },
  { name: "Lirili Larila", icon: "🐘🌵", desc: "A cactus-elephant hybrid wearing sandals controlling time" },
  { name: "Trippi Troppi", icon: "🐱🦐", desc: "A cat with a shrimp's body eating everything in sight" }
];

export const QUESTION_PACKS: QuestionPack[] = [
  {
    id: 'p1',
    title: 'The Great Pasta Mystery',
    questions: [
      { id: 'animal', label: 'A silly animal', type: 'text', placeholder: 'e.g. Capybara' },
      { id: 'object', label: 'A household object', type: 'text', placeholder: 'e.g. Toaster' },
      { id: 'food', label: 'A food you love', type: 'text', placeholder: 'e.g. Pizza' },
      { id: 'sound', label: 'A funny sound', type: 'text', placeholder: 'e.g. Boing!' },
      { id: 'place', label: 'A place (real or fake)', type: 'text', placeholder: 'e.g. The Moon' },
      { id: 'color', label: 'A bright color', type: 'select', options: ['Neon Pink', 'Slime Green', 'Electric Blue', 'Zesty Orange'] },
      { id: 'power', label: 'A silly superpower', type: 'text', placeholder: 'e.g. Turning into cheese' },
      { id: 'friend', label: 'A friend\'s name', type: 'text', placeholder: 'First name only' }
    ]
  },
  {
    id: 'p2',
    title: 'The Glitched Gondola',
    questions: [
      { id: 'creature', label: 'A weird hybrid creature', type: 'text', placeholder: 'e.g. Cat-Airplane' },
      { id: 'toy', label: 'A favorite toy', type: 'text', placeholder: 'e.g. Rubber Duck' },
      { id: 'drink', label: 'A fizzy drink', type: 'text', placeholder: 'e.g. Grape Soda' },
      { id: 'action', label: 'A dance move', type: 'text', placeholder: 'e.g. The Floss' },
      { id: 'location', label: 'Where are we?', type: 'text', placeholder: 'e.g. Inside a giant taco' },
      { id: 'feeling', label: 'How do you feel?', type: 'select', options: ['Confused', 'Super Happy', 'Sleepy', 'Hyper'] },
      { id: 'special_tool', label: 'A non-violent tool', type: 'text', placeholder: 'e.g. A giant spoon' },
      { id: 'hero', label: 'Your hero name', type: 'text', placeholder: 'e.g. Captain Sprinkles' }
    ]
  },
  {
    id: 'p3',
    title: 'Brainrot Beach Party',
    questions: [
      { id: 'fish', label: 'A sea creature', type: 'text', placeholder: 'e.g. Blobfish' },
      { id: 'object', label: 'A weird object', type: 'text', placeholder: 'e.g. Pogo Stick' },
      { id: 'snack', label: 'Best snack ever', type: 'text', placeholder: 'e.g. Cheetos' },
      { id: 'shout', label: 'Something to scream', type: 'text', placeholder: 'e.g. YEET!' },
      { id: 'planet', label: 'A planet', type: 'text', placeholder: 'e.g. Saturn' },
      { id: 'vehicle', label: 'A wacky car', type: 'text', placeholder: 'e.g. Shoe-mobile' },
      { id: 'job', label: 'A silly job', type: 'text', placeholder: 'e.g. Professional Napper' },
      { id: 'name', label: 'Your bestie', type: 'text', placeholder: 'First name' }
    ]
  },
  {
    id: 'p4',
    title: 'The Neon Pizza Planet',
    questions: [
      { id: 'alien', label: 'A weird alien animal', type: 'text', placeholder: 'e.g. Space Pug' },
      { id: 'gadget', label: 'A kitchen gadget', type: 'text', placeholder: 'e.g. Egg Beater' },
      { id: 'topping', label: 'A pizza topping', type: 'text', placeholder: 'e.g. Pineapple' },
      { id: 'noise', label: 'An alien noise', type: 'text', placeholder: 'e.g. Gloorp!' },
      { id: 'galaxy', label: 'Name of a galaxy', type: 'text', placeholder: 'e.g. The Lasagna Galaxy' },
      { id: 'color2', label: 'Glowy color', type: 'select', options: ['Laser Cyan', 'Magma Red', 'Toxic Purple', 'Cosmic Gold'] },
      { id: 'ability', label: 'A space power', type: 'text', placeholder: 'e.g. Floating in gravy' },
      { id: 'pilot', label: 'Co-pilot name', type: 'text', placeholder: 'First name' }
    ]
  },
  {
    id: 'p5',
    title: 'Ancient Roman Roblox',
    questions: [
      { id: 'beast', label: 'A jungle beast', type: 'text', placeholder: 'e.g. Tiger' },
      { id: 'tool', label: 'A garden tool', type: 'text', placeholder: 'e.g. Watering Can' },
      { id: 'fruit', label: 'A giant fruit', type: 'text', placeholder: 'e.g. Watermelon' },
      { id: 'exclamation', label: 'A funny word', type: 'text', placeholder: 'e.g. Skibidi!' },
      { id: 'empire', label: 'A place in time', type: 'text', placeholder: 'e.g. Dinosaur Land' },
      { id: 'vibe', label: 'How is the weather?', type: 'select', options: ['Meatball Storm', 'Cloudy with Soda', 'Sunny Cheese', 'Rainbow Fog'] },
      { id: 'magic', label: 'A silly spell', type: 'text', placeholder: 'e.g. Infinite Pasta' },
      { id: 'rival', label: 'A funny rival name', type: 'text', placeholder: 'First name' }
    ]
  }
];
