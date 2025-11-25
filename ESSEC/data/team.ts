export interface TeamMember {
  id: string
  name: string
  role: string
  roleKey: string
  bio: string
  photo: string
}

export const teamMembers: TeamMember[] = [
  {
    id: 'ceo',
    name: 'Ahmed Al-Mansouri',
    role: 'Chief Executive Officer',
    roleKey: 'ceo',
    bio: 'With over 20 years of experience in renewable energy and engineering, Ahmed has led ESSEC to become a regional leader in solar solutions. He holds a Master\'s degree in Electrical Engineering and has overseen the completion of over 500 solar projects.',
    photo: '/team/ceo.jpg',
  },
  {
    id: 'executive-director',
    name: 'Sarah Johnson',
    role: 'Executive Director',
    roleKey: 'executiveDirector',
    bio: 'Sarah brings extensive expertise in project management and business development. She has been instrumental in expanding ESSEC\'s operations across multiple regions and establishing strategic partnerships with leading solar technology providers.',
    photo: '/team/executive-director.jpg',
  },
  {
    id: 'engineer-1',
    name: 'Mohammed Hassan',
    role: 'Senior Solar Engineer',
    roleKey: 'engineer',
    bio: 'Mohammed is a certified solar engineer with 15 years of experience in system design and installation. He specializes in large-scale commercial and industrial solar projects and holds multiple certifications in renewable energy systems.',
    photo: '/team/engineer-1.jpg',
  },
  {
    id: 'engineer-2',
    name: 'Fatima Al-Zahra',
    role: 'Lead Design Engineer',
    roleKey: 'engineer',
    bio: 'Fatima is an expert in solar system design and optimization. With a Ph.D. in Renewable Energy, she has designed over 200 solar installations and is known for her innovative approaches to maximizing system efficiency and ROI.',
    photo: '/team/engineer-2.jpg',
  },
  {
    id: 'engineer-3',
    name: 'David Chen',
    role: 'Project Engineer',
    roleKey: 'engineer',
    bio: 'David specializes in project execution and quality control. He ensures that all installations meet the highest standards and has successfully managed projects ranging from residential to utility-scale solar farms.',
    photo: '/team/engineer-3.jpg',
  },
]

