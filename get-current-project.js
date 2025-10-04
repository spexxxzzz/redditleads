const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getCurrentProject() {
  try {
    console.log('🔍 Getting current project for user...');
    
    const userId = 'user_33Xjzg8eYYWpoPXOMQcvKhbw33b';
    
    console.log(`👤 User ID: ${userId}`);
    
    // Get the most recent project for this user
    const project = await prisma.project.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        analyzedUrl: true,
        discoveryStatus: true,
        createdAt: true,
        _count: {
          select: {
            leads: true
          }
        }
      }
    });
    
    if (!project) {
      console.log('❌ No projects found for this user');
      return;
    }
    
    console.log('\n✅ Current Project:');
    console.log(`  ID: ${project.id}`);
    console.log(`  Name: ${project.name}`);
    console.log(`  URL: ${project.analyzedUrl}`);
    console.log(`  Status: ${project.discoveryStatus || 'not_started'}`);
    console.log(`  Leads: ${project._count.leads}`);
    console.log(`  Created: ${project.createdAt}`);
    
    console.log('\n🎯 Use this project ID in your frontend:');
    console.log(`  Project ID: ${project.id}`);
    
    // Also check if there are any other projects
    const allProjects = await prisma.project.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            leads: true
          }
        }
      }
    });
    
    if (allProjects.length > 1) {
      console.log('\n📋 All projects for this user:');
      allProjects.forEach((p, index) => {
        console.log(`  ${index + 1}. ${p.name} (${p.id})`);
        console.log(`     Leads: ${p._count.leads}`);
        console.log(`     Created: ${p.createdAt}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error getting current project:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getCurrentProject();
