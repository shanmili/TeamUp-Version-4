import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Switch } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import ProjectCard from '../components/ProjectCard';
import MemberRequestCard from '../components/MemberRequestCard';
import StudentCard from '../components/StudentCard';
import MessageItem from '../components/MessageItem';
import SkillItem from '../components/SkillItem';
import ProjectHistoryItem from '../components/ProjectHistoryItem';
import StatBox from '../components/StatBox';

// Custom BottomTabs removed — using expo-router file-based tabs instead

// Teams Screen (for regular members)
function TeamsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TeamUp</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.notificationBadge}>
              <Feather name="bell" color="#fff" size={20} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButtonPrimary}>
            <Feather name="plus" color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" color="#9ca3af" size={18} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search teams or projects..."
          placeholderTextColor="#9ca3af"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Current Team with Banner */}
        <View style={styles.currentTeamBanner}>
          <View style={styles.bannerIcon}>
            <Text style={styles.bannerEmoji}>⚡</Text>
          </View>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerLabel}>Looking for members</Text>
            <Text style={styles.bannerTitle}>Sustainable Energy App</Text>
            <View style={styles.bannerMeta}>
              <Feather name="users" color="#666" size={14} />
              <Text style={styles.bannerMetaText}>2/5 members</Text>
              <MaterialIcons name="calendar-today" color="#666" size={14} style={{ marginLeft: 12 }} />
              <Text style={styles.bannerMetaText}>Due 11/30/2024</Text>
            </View>
            <View style={styles.techTags}>
              <Text style={styles.techTag}>IoT</Text>
              <Text style={styles.techTag}>Data Analysis</Text>
              <Text style={styles.techTag}>Mobile Dev</Text>
            </View>
            <Text style={styles.memberStatus}>Member • Complete</Text>
          </View>
        </View>

        {/* Recommended Section */}
        <Text style={styles.sectionTitle}>Recommended for You</Text>

        <ProjectCard
          title="Blockchain Voting System"
          members="2/4"
          dueDate="12/20/2024"
          tags={[ 'Blockchain', 'Security', 'Web3' ]}
          match={90}
        />

        <ProjectCard
          title="Smart Campus Navigation"
          members="1/3"
          dueDate="12/10/2024"
          tags={[ 'React Native', 'GPS', 'UI/UX' ]}
          match={92}
        />

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatBox value="12" label="Active Teams" color="#2563eb" />
          <StatBox value="8" label="Matches Found" color="#10b981" />
          <StatBox value="5" label="Advisors Available" color="#f59e0b" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Teams Screen (for Team Leads with management features)
function TeamLeadScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TeamUp</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.notificationBadge}>
              <Feather name="bell" color="#fff" size={20} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButtonPrimary}>
            <Feather name="plus" color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" color="#9ca3af" size={18} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search teams or projects..."
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tabButtonText}>My Teams</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, styles.tabButtonActive]}>
          <Text style={[styles.tabButtonText, styles.tabButtonTextActive]}>Manage Team</Text>
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tabButtonText}>Discover</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Team Management Section */}
        <Text style={styles.sectionTitle}>Team Management</Text>
        <Text style={styles.sectionSubtitle}>2 pending member requests</Text>

        {/* Member Request Card */}
        <MemberRequestCard
          name="Jessica Park"
          major="Computer Science • Junior"
          gpa="3.9"
          project="AI Healthcare Platform"
          skills={[ 'Python', 'Machine Learning', 'Statistics' ]}
          message="Hi! I'm very interested in healthcare AI and have experience with ML models. I'd love to contribute to your project!"
          time="2 hours ago"
          match={94}
        />

        <MemberRequestCard
          name="David Kim"
          major="Computer Science • Senior"
          gpa="3.7"
          project="AI Healthcare Platform"
          skills={[ 'React Native', 'Node.js', 'UI/UX' ]}
          message="I have extensive experience in mobile development and would like to help build the frontend of the platform."
          time="3 hours ago"
          match={89}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// Discover Screen
function DiscoverScreen() {
  const [activeTab, setActiveTab] = useState('students');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.discoverHeader}>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity>
          <Feather name="filter" color="#000" size={24} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" color="#9ca3af" size={18} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by skills, interests, or name..."
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Student/Advisor Tabs */}
      <View style={styles.toggleTabs}>
        <TouchableOpacity 
          style={[styles.toggleTab, activeTab === 'students' && styles.toggleTabActive]}
          onPress={() => setActiveTab('students')}
        >
          <Text style={[styles.toggleTabText, activeTab === 'students' && styles.toggleTabTextActive]}>
            Students
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleTab, activeTab === 'advisors' && styles.toggleTabActive]}
          onPress={() => setActiveTab('advisors')}
        >
          <Text style={[styles.toggleTabText, activeTab === 'advisors' && styles.toggleTabTextActive]}>
            Advisors
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.matchCount}>3 students match your criteria</Text>

        <StudentCard
          name="Sarah Chen"
          major="Computer Science • Senior"
          rating={4.8}
          projects={3}
          availability="Available"
          skills={[ 'React Native', 'Python', 'UI/UX Design' ]}
          interests={[ 'AI/ML', 'Mobile Development', 'Healthcare Tech' ]}
          match={95}
        />

        <StudentCard
          name="Marcus Johnson"
          major="Data Science • Junior"
          rating={4.6}
          projects={2}
          availability="Busy until Dec 1"
          skills={[ 'Python', 'Machine Learning', 'Data Analysis' ]}
          interests={[ 'AI/ML', 'Blockchain', 'FinTech' ]}
          match={87}
        />

        <StudentCard
          name="Emily Rodriguez"
          major="Software Engineering • Senior"
          rating={4.9}
          projects={5}
          availability="Available"
          skills={[ 'Full Stack', 'DevOps', 'Cloud Computing' ]}
          interests={[ 'Web Development', 'Cloud Tech', 'Sustainability' ]}
          match={92}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// Messages Screen
function MessagesScreen() {
  const [activeTab, setActiveTab] = useState('team');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.messagesHeader}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.iconButtonPrimary}>
          <Feather name="edit-2" color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" color="#9ca3af" size={18} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Team/Direct Tabs */}
      <View style={styles.toggleTabs}>
        <TouchableOpacity 
          style={[styles.toggleTab, activeTab === 'team' && styles.toggleTabActive]}
          onPress={() => setActiveTab('team')}
        >
          <Text style={[styles.toggleTabText, activeTab === 'team' && styles.toggleTabTextActive]}>
            Team Chats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleTab, activeTab === 'direct' && styles.toggleTabActive]}
          onPress={() => setActiveTab('direct')}
        >
          <Text style={[styles.toggleTabText, activeTab === 'direct' && styles.toggleTabTextActive]}>
            Direct Messages
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {activeTab === 'team' ? (
          <>
            <MessageItem
              avatar="AH"
              name="AI Healthcare Platform"
              message="Sarah: Great progress on the ML model! Read..."
              time="2 min ago"
              unread={1}
              members={4}
              active
            />
            <MessageItem
              avatar="BV"
              name="Blockchain Voting System"
              message="Marcus: Meeting scheduled for tomorrow at 3..."
              time="1 hour ago"
              members={3}
              active
            />
            <MessageItem
              avatar="SC"
              name="Smart Campus Navigation"
              message="Emily: UI mockups are ready for review"
              time="3 hours ago"
              unread={1}
              members={2}
              inactive
            />
          </>
        ) : (
          <>
            <MessageItem
              avatar="DL"
              avatarColor="#10b981"
              name="Dr. Jennifer Liu"
              role="Advisor"
              message="Your team proposal looks excellent. Let's discuss the timeline."
              time="30 min ago"
              unread={1}
            />
            <MessageItem
              avatar="SC"
              avatarColor="#3b82f6"
              name="Sarah Chen"
              role="Teammate"
              message="Can you review the code I pushed yesterday?"
              time="2 hours ago"
            />
            <MessageItem
              avatar="MJ"
              avatarColor="#6366f1"
              name="Marcus Johnson"
              message="Thanks for the collaboration invite!"
              time="1 day ago"
            />
            <MessageItem
              avatar="PMT"
              avatarColor="#10b981"
              name="Prof. Michael Torres"
              role="Advisor"
              message="Office hours are available this Friday"
              time="2 days ago"
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Profile Screen
function ProfileScreen() {
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.profileHeader}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButtonOutline}>
            <Feather name="settings" color="#666" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButtonPrimary}>
            <Feather name="edit-2" color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>AT</Text>
          </View>
          <Text style={styles.profileName}>Alex Thompson</Text>
          <Text style={styles.profileMajor}>Computer Science • Senior</Text>
          <Text style={styles.profileBio}>
            Passionate about AI/ML and mobile development. Looking to work on innovative projects that make a real impact.
          </Text>
          
          <View style={styles.availabilityToggle}>
            <Text style={styles.availabilityText}>Available for new teams</Text>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={isAvailable ? '#2563eb' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactItem}>
            <Feather name="mail" color="#666" size={18} />
            <Text style={styles.contactText}>alex.thompson@university.edu</Text>
          </View>
          <View style={styles.contactItem}>
            <Feather name="phone" color="#666" size={18} />
            <Text style={styles.contactText}>+1 (555) 123-4567</Text>
          </View>
          <View style={styles.contactItem}>
            <Feather name="map-pin" color="#666" size={18} />
            <Text style={styles.contactText}>San Francisco, CA</Text>
          </View>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills & Expertise</Text>
          <SkillItem skill="React Native" level="Advanced" category="Mobile" />
          <SkillItem skill="Python" level="Advanced" category="Programming" />
          <SkillItem skill="Machine Learning" level="Intermediate" category="AI/ML" />
          <SkillItem skill="UI/UX Design" level="Intermediate" category="Design" />
          <SkillItem skill="Node.js" level="Intermediate" category="Backend" />
          <SkillItem skill="PostgreSQL" level="Beginner" category="Database" />
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestTags}>
            <Text style={styles.interestTag}>Artificial Intelligence</Text>
            <Text style={styles.interestTag}>Mobile Development</Text>
            <Text style={styles.interestTag}>Healthcare Technology</Text>
            <Text style={styles.interestTag}>Sustainability</Text>
            <Text style={styles.interestTag}>Fintech</Text>
            <Text style={styles.interestTag}>Education Technology</Text>
          </View>
        </View>

        {/* Project History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project History</Text>
          
          <ProjectHistoryItem
            title="AI Healthcare Platform"
            role="Lead Developer"
            rating={4.8}
            status="In Progress"
            statusColor="#f59e0b"
          />
          <ProjectHistoryItem
            title="Campus Food Delivery App"
            role="Frontend Developer"
            rating={4.6}
            status="Completed"
            statusColor="#10b981"
          />
          <ProjectHistoryItem
            title="Study Group Finder"
            role="Full Stack Developer"
            rating={4.9}
            status="Completed"
            statusColor="#10b981"
          />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatBox value="4.8" label="Avg Rating" color="#2563eb" />
          <StatBox value="3" label="Projects" color="#10b981" />
          <StatBox value="6" label="Skills" color="#f59e0b" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable components have been moved to `app/components/*` and are imported at the top of this file.

// Main App Component
export default function TeamUpApp() {
  // This screen now redirects into the file-based tabs layout.
  const router = require('expo-router').useRouter();

  useEffect(() => {
    router.replace('/(tabs)/teams');
  }, []);

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonPrimary: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonOutline: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ef4444',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  tabButtonActive: {
    backgroundColor: '#2563eb',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  tabLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#2563eb',
  },
  bottomTabs: {
    height: 72,
    borderTopWidth: 1,
    borderTopColor: '#eef2ff',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  tabLabelActive: {
    color: '#2563eb',
  },
  // Minimal placeholders for removed components' styles to avoid runtime errors
  studentCard: {},
  messageItem: {},
  skillItem: {},
  projectHistoryItem: {},
  statBox: {},
});

