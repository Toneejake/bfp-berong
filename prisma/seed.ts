import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bfp.gov.ph' },
    update: {},
    create: {
      email: 'admin@bfp.gov.ph',
      password: adminPassword,
      name: 'BFP Administrator',
      age: 30,
      role: 'admin',
      isActive: true,
    },
  })
  console.log('✅ Created admin user:', adminUser.email)

  // Create sample users for testing
  const kidPassword = await bcrypt.hash('kid123', 10)
  const adultPassword = await bcrypt.hash('adult123', 10)
  const professionalPassword = await bcrypt.hash('pro123', 10)

  const kidUser = await prisma.user.upsert({
    where: { email: 'kid@bfp.gov.ph' },
    update: {},
    create: {
      email: 'kid@bfp.gov.ph',
      password: kidPassword,
      name: 'Young Firefighter',
      age: 12,
      role: 'kid',
      isActive: true,
    },
  })

  const adultUser = await prisma.user.upsert({
    where: { email: 'adult@bfp.gov.ph' },
    update: {},
    create: {
      email: 'adult@bfp.gov.ph',
      password: adultPassword,
      name: 'John Smith',
      age: 25,
      role: 'adult',
      isActive: true,
    },
  })

  const professionalUser = await prisma.user.upsert({
    where: { email: 'pro@bfp.gov.ph' },
    update: {},
    create: {
      email: 'pro@bfp.gov.ph',
      password: professionalPassword,
      name: 'Firefighter Cruz',
      age: 28,
      role: 'professional',
      isActive: true,
    },
  })

  console.log('✅ Created sample users')

  // Seed carousel images
  const carouselImages = [
    {
      title: 'BFP Firefighters in Action',
      altText: 'BFP Firefighters in Action',
      imageUrl: '/bfp-firefighters-in-action.jpg',
      order: 1,
      isActive: true,
    },
    {
      title: 'Fire Safety Training',
      altText: 'Fire Safety Training',
      imageUrl: '/fire-safety-training-session.jpg',
      order: 2,
      isActive: true,
    },
    {
      title: 'BFP Sta Cruz - Always Ready',
      altText: 'BFP Sta Cruz',
      imageUrl: '/bfp-sta-cruz-fire-station.jpg',
      order: 3,
      isActive: true,
    },
  ]

  for (const image of carouselImages) {
    await prisma.carouselImage.create({
      data: image,
    })
  }
  console.log('✅ Seeded carousel images')

  // Seed videos
  const videos = [
    {
      title: 'Advanced Firefighting Techniques',
      description: 'Professional firefighting methods and strategies',
      youtubeId: 'W25rzeEO740',
      category: 'professional' as const,
      duration: '15:30',
      isActive: true,
    },
    {
      title: 'Fire Code Compliance',
      description: 'Understanding fire safety regulations',
      youtubeId: 'ldPH_D60jpo',
      category: 'professional' as const,
      duration: '12:45',
      isActive: true,
    },
    {
      title: 'Emergency Response Protocols',
      description: 'Standard operating procedures for emergencies',
      youtubeId: '9XpJZv_YsGM',
      category: 'professional' as const,
      duration: '18:20',
      isActive: true,
    },
    {
      title: 'Fire Investigation Basics',
      description: 'Introduction to fire investigation techniques',
      youtubeId: '5_YeQpOXnP8',
      category: 'professional' as const,
      duration: '20:15',
      isActive: true,
    },
    {
      title: 'Hazardous Materials Handling',
      description: 'Safe handling of hazardous materials in fire scenarios',
      youtubeId: 'q_oBg1U2x9Q',
      category: 'professional' as const,
      duration: '16:40',
      isActive: true,
    },
    {
      title: 'Rescue Operations',
      description: 'Advanced rescue techniques and equipment',
      youtubeId: 'x1oo76Y_87A',
      category: 'professional' as const,
      duration: '14:25',
      isActive: true,
    },
    {
      title: 'Fire Prevention Strategies',
      description: 'Proactive fire prevention in communities',
      youtubeId: 'sCmPKeTILq4',
      category: 'professional' as const,
      duration: '11:30',
      isActive: true,
    },
  ]

  for (const video of videos) {
    await prisma.video.create({
      data: video,
    })
  }
  console.log('✅ Seeded professional videos')

  // Seed blog posts
  const blogPosts = [
    {
      title: 'Home Fire Safety Essentials',
      excerpt: 'Learn the basic fire safety measures every home should have',
      content: 'Fire safety at home is crucial for protecting your family and property. Install smoke detectors on every level of your home, especially near bedrooms. Test them monthly and replace batteries annually. Keep fire extinguishers in key locations like the kitchen and garage. Create and practice a fire escape plan with your family. Ensure everyone knows two ways out of every room and establish a meeting point outside.',
      imageUrl: '/home-fire-safety-equipment.jpg',
      category: 'adult' as const,
      authorId: adultUser.id,
      isPublished: true,
    },
    {
      title: 'Kitchen Fire Prevention',
      excerpt: 'Prevent the most common cause of home fires',
      content: 'Kitchen fires are the leading cause of home fires. Never leave cooking unattended, especially when frying, grilling, or broiling. Keep flammable items away from the stove. Clean cooking surfaces regularly to prevent grease buildup. Keep a lid nearby to smother small pan fires. Never use water on grease fires. Install a fire extinguisher in your kitchen and learn how to use it properly.',
      imageUrl: '/kitchen-fire-safety-cooking.jpg',
      category: 'adult' as const,
      authorId: adultUser.id,
      isPublished: true,
    },
    {
      title: 'Electrical Fire Safety',
      excerpt: 'Protect your home from electrical hazards',
      content: 'Electrical fires can be prevented with proper awareness. Avoid overloading outlets and power strips. Replace damaged or frayed electrical cords immediately. Use the correct wattage for light fixtures. Have a qualified electrician inspect your home regularly. Never run cords under rugs or furniture. Unplug appliances when not in use, especially heat-producing devices.',
      imageUrl: '/electrical-safety-outlets-wiring.jpg',
      category: 'adult' as const,
      authorId: adultUser.id,
      isPublished: true,
    },
    {
      title: 'Fire Escape Planning',
      excerpt: 'Create an effective evacuation plan for your family',
      content: 'A well-practiced fire escape plan can save lives. Draw a floor plan of your home showing all doors and windows. Mark two escape routes from each room. Choose an outside meeting place a safe distance from your home. Practice your escape plan at least twice a year. Make sure everyone knows how to call emergency services. Consider special needs of children, elderly, or disabled family members.',
      imageUrl: '/family-fire-escape-plan.jpg',
      category: 'adult' as const,
      authorId: adultUser.id,
      isPublished: true,
    },
    {
      title: 'Smoke Detector Maintenance',
      excerpt: 'Keep your first line of defense working properly',
      content: 'Smoke detectors are your first warning of fire. Install them on every level of your home and in every bedroom. Test detectors monthly by pressing the test button. Replace batteries at least once a year. Replace the entire unit every 10 years. Clean detectors regularly to remove dust. Consider interconnected detectors so when one sounds, they all sound.',
      imageUrl: '/smoke-detector-alarm-maintenance.jpg',
      category: 'adult' as const,
      authorId: adultUser.id,
      isPublished: true,
    },
    {
      title: 'Fire Extinguisher Guide',
      excerpt: 'Know how to use a fire extinguisher effectively',
      content: 'Remember PASS: Pull the pin, Aim at the base of the fire, Squeeze the handle, and Sweep from side to side. Keep extinguishers in accessible locations. Check pressure gauges monthly. Know the different types: Class A for ordinary combustibles, Class B for flammable liquids, Class C for electrical fires. Most home extinguishers are ABC rated for all three. Only fight small fires - if in doubt, evacuate and call 911.',
      imageUrl: '/fire-extinguisher-usage-demonstration.jpg',
      category: 'adult' as const,
      authorId: adultUser.id,
      isPublished: true,
    },
  ]

  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: post,
    })
  }
  console.log('✅ Seeded blog posts')

  // Seed kids modules (sample 5 modules for demo)
  const kidsModules = [
    {
      title: 'Fire Safety Basics',
      description: 'Introduction to fire safety for kids',
      dayNumber: 1,
      content: 'Fire is hot and can be dangerous. We need to learn how to stay safe around fire. Today we will learn about what fire needs to burn and why we should never play with matches or lighters.',
      isActive: true,
    },
    {
      title: 'Stop, Drop, and Roll',
      description: 'What to do if your clothes catch fire',
      dayNumber: 2,
      content: 'If your clothes ever catch on fire, remember: Stop, Drop, and Roll! Stop where you are, drop to the ground, and roll over and over to put out the flames. Practice this with your family.',
      isActive: true,
    },
    {
      title: 'Smoke Detectors',
      description: 'Why smoke detectors are important',
      dayNumber: 3,
      content: 'Smoke detectors are like watchdogs that warn us when there is smoke or fire. They make a loud noise to wake us up if there is danger. We need smoke detectors in every bedroom and on every floor.',
      isActive: true,
    },
    {
      title: 'Fire Escape Plan',
      description: 'Planning how to get out of the house safely',
      dayNumber: 4,
      content: 'Every family needs a fire escape plan. Draw a map of your home and mark two ways out of every room. Choose a safe meeting place outside. Practice your escape plan with your family.',
      isActive: true,
    },
    {
      title: 'Firefighter Heroes',
      description: 'Learning about firefighters and their equipment',
      dayNumber: 5,
      content: 'Firefighters are brave heroes who help us when there are fires. They wear special suits, helmets, and use big trucks with ladders. They help people and put out fires to keep us safe.',
      isActive: true,
    },
  ]

  for (const module of kidsModules) {
    await prisma.kidsModule.upsert({
      where: { dayNumber: module.dayNumber },
      update: {},
      create: module,
    })
  }
  console.log('✅ Seeded kids modules')

  // Seed quick questions for chatbot
  const quickQuestions = [
    // Emergency Procedures
    {
      category: 'emergency' as const,
      questionText: 'What should I do if I see a fire?',
      responseText: 'If you see a fire, immediately evacuate the area and call emergency services (911 or your local emergency number). Never try to retrieve personal belongings. Once you are safe, alert others and stay at a safe distance until help arrives.',
      order: 1,
      isActive: true,
    },
    {
      category: 'emergency' as const,
      questionText: 'How do I report a fire emergency?',
      responseText: 'Call 911 (or your local emergency number) immediately. Provide your exact location, the nature of the emergency, and any relevant details about the fire. Do not hang up until the operator tells you to do so.',
      order: 2,
      isActive: true,
    },
    {
      category: 'emergency' as const,
      questionText: 'What is the emergency number?',
      responseText: 'In case of fire emergency, dial 911 (or your local emergency number). For non-emergency inquiries, you can visit your nearest BFP station or call their office during business hours.',
      order: 3,
      isActive: true,
    },

    // Fire Prevention
    {
      category: 'prevention' as const,
      questionText: 'How can I prevent home fires?',
      responseText: 'To prevent home fires: Never leave cooking unattended, keep flammable items away from heat sources, have electrical wiring checked regularly, properly store flammable liquids, and install and maintain smoke alarms.',
      order: 1,
      isActive: true,
    },
    {
      category: 'prevention' as const,
      questionText: 'What are common fire hazards?',
      responseText: 'Common fire hazards include: unattended candles, overloaded electrical outlets, faulty wiring, uncleaned dryer vents, improperly stored flammable materials, and children playing with matches or lighters.',
      order: 2,
      isActive: true,
    },
    {
      category: 'prevention' as const,
      questionText: 'How often should I inspect my home?',
      responseText: 'Conduct a home fire safety inspection monthly. Check smoke alarms, test fire extinguishers, inspect electrical cords, and ensure heating equipment is clean and properly ventilated.',
      order: 3,
      isActive: true,
    },

    // Safety Equipment
    {
      category: 'equipment' as const,
      questionText: 'How do I use a fire extinguisher?',
      responseText: 'To use a fire extinguisher, remember the acronym PASS: Pull the pin, Aim at the base of the fire, Squeeze the handle, and Sweep from side to side. Only attempt to use an extinguisher on small fires and always have an escape route.',
      order: 1,
      isActive: true,
    },
    {
      category: 'equipment' as const,
      questionText: 'How do I test my smoke alarm?',
      responseText: 'Press and hold the test button on your smoke alarm until it sounds. If it doesn\'t sound, replace the batteries immediately. Test your smoke alarms monthly and replace batteries annually.',
      order: 2,
      isActive: true,
    },
    {
      category: 'equipment' as const,
      questionText: 'What types of fire extinguishers are there?',
      responseText: 'Common fire extinguisher types: Class A (ordinary combustibles like wood/paper), Class B (flammable liquids like gasoline), Class C (electrical fires), Class D (combustible metals), and Class K (cooking oils/greases).',
      order: 3,
      isActive: true,
    },

    // General Information
    {
      category: 'general' as const,
      questionText: 'What are fire safety inspections?',
      responseText: 'Fire safety inspections ensure buildings comply with fire codes. Businesses and multi-family dwellings are required to have regular inspections. Contact your local BFP station to schedule an inspection.',
      order: 1,
      isActive: true,
    },
    {
      category: 'general' as const,
      questionText: 'How do I create a fire escape plan?',
      responseText: 'Create a home fire escape plan: Draw a map of your home, mark two ways out of each room, establish a meeting place outside, practice the drill twice a year, and ensure everyone knows how to call emergency services.',
      order: 2,
      isActive: true,
    },
  ];

  for (const question of quickQuestions) {
    await prisma.quickQuestion.create({
      data: question,
    });
  }
  console.log('✅ Seeded quick questions for chatbot');

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📋 Test Accounts Created:')
  console.log('Admin: admin@bfp.gov.ph / admin123')
  console.log('Kid: kid@bfp.gov.ph / kid123')
  console.log('Adult: adult@bfp.gov.ph / adult123')
  console.log('Professional: pro@bfp.gov.ph / pro123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
