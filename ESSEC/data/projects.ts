export interface Project {
  id: string
  name: string
  location: string
  year: number
  duration: string
  image: string
  video?: string
  description: string
  challenges: string[]
  executionMethods: string[]
  results: string[]
  technicalNotes: string
  gallery: string[]
}

export const projects: Project[] = [
  {
    id: 'commercial-solar-farm',
    name: 'Commercial Solar Farm - Industrial Complex',
    location: 'Industrial Zone, City Center',
    year: 2023,
    duration: '18 months',
    image: '/projects/commercial-1.jpg',
    video: '/projects/commercial-video.mp4',
    description: 'A large-scale 5MW commercial solar farm installed for a major industrial complex. This project involved designing and installing a comprehensive solar PV system to meet 80% of the facility\'s energy needs, significantly reducing operational costs and carbon footprint.',
    challenges: [
      'Large area coverage requiring extensive planning',
      'Integration with existing electrical infrastructure',
      'Minimizing disruption to ongoing operations',
      'Weather-resistant installation for harsh conditions',
      'Compliance with local grid connection regulations',
    ],
    executionMethods: [
      'Comprehensive site survey and shadow analysis',
      'Custom mounting system design for optimal tilt and orientation',
      'Phased installation approach to minimize downtime',
      'Advanced monitoring system for real-time performance tracking',
      'Professional grid integration with utility coordination',
    ],
    results: [
      '5MW installed capacity generating 7,500 MWh annually',
      '80% reduction in electricity costs',
      '6,500 tons CO2 reduction per year',
      'Payback period of 6.5 years',
      'ROI of 15% over 25-year lifespan',
    ],
    technicalNotes: 'System includes 12,500 monocrystalline panels (400W each), 10 central inverters (500kW), advanced monitoring system, and grid-tie infrastructure. All components meet IEC and local standards.',
    gallery: [
      '/projects/commercial-1.jpg',
      '/projects/commercial-2.jpg',
      '/projects/commercial-3.jpg',
      '/projects/commercial-4.jpg',
    ],
  },
  {
    id: 'residential-complex',
    name: 'Residential Complex Solar Installation',
    location: 'Suburban Residential Area',
    year: 2023,
    duration: '8 months',
    image: '/projects/residential-1.jpg',
    video: '/projects/residential-video.mp4',
    description: 'Complete solar energy solution for a 200-unit residential complex, including rooftop solar panels, centralized monitoring, and individual unit metering. This project provides clean energy to all residents while reducing common area electricity costs.',
    challenges: [
      'Multiple building rooftops with varying orientations',
      'Coordinating with residents and property management',
      'Individual unit metering and billing',
      'Aesthetic considerations for residential area',
      'Minimal disruption to residents during installation',
    ],
    executionMethods: [
      'Detailed roof assessment for each building',
      'Custom mounting solutions for different roof types',
      'Centralized inverter system with individual monitoring',
      'Scheduled installation during low-occupancy periods',
      'Comprehensive resident education and support',
    ],
    results: [
      '2.5MW total capacity across 200 units',
      '40% reduction in common area electricity costs',
      'Individual savings of $50-100/month per unit',
      'Increased property value by 8%',
      '100% resident satisfaction rate',
    ],
    technicalNotes: 'System includes 6,250 polycrystalline panels, 25 string inverters, net metering setup, and cloud-based monitoring platform accessible to residents. All installations include 25-year warranty.',
    gallery: [
      '/projects/residential-1.jpg',
      '/projects/residential-2.jpg',
      '/projects/residential-3.jpg',
    ],
  },
  {
    id: 'hospital-solar',
    name: 'Hospital Solar & Backup System',
    location: 'Medical District',
    year: 2022,
    duration: '12 months',
    image: '/projects/hospital-1.jpg',
    video: '/projects/hospital-video.mp4',
    description: 'Critical solar installation for a major hospital, including both grid-tied solar panels and battery backup system to ensure uninterrupted power supply for critical medical equipment. This hybrid system provides both cost savings and reliability.',
    challenges: [
      'Critical power requirements for medical equipment',
      'Strict safety and reliability standards',
      '24/7 operation with no downtime allowed',
      'Integration with existing backup generators',
      'Compliance with healthcare facility regulations',
    ],
    executionMethods: [
      'Redundant system design for maximum reliability',
      'Battery storage for critical load backup',
      'Automatic transfer switches for seamless operation',
      'Isolated installation to prevent interference',
      'Comprehensive testing and certification',
    ],
    results: [
      '1.5MW solar capacity with 500kWh battery backup',
      '60% reduction in electricity costs',
      'Zero downtime during installation',
      '4-hour backup power for critical loads',
      'Enhanced facility resilience',
    ],
    technicalNotes: 'Hybrid system with 3,750 panels, grid-tied inverters, 500kWh lithium-ion battery bank, automatic transfer switches, and integration with existing diesel generators. System meets NFPA and healthcare facility standards.',
    gallery: [
      '/projects/hospital-1.jpg',
      '/projects/hospital-2.jpg',
      '/projects/hospital-3.jpg',
      '/projects/hospital-4.jpg',
      '/projects/hospital-5.jpg',
    ],
  },
  {
    id: 'agricultural-solar',
    name: 'Agricultural Solar Pump System',
    location: 'Rural Farming Area',
    year: 2022,
    duration: '4 months',
    image: '/projects/agricultural-1.jpg',
    video: '/projects/agricultural-video.mp4',
    description: 'Large-scale solar-powered irrigation system for a 500-acre agricultural farm. This off-grid system provides reliable water pumping for crops, eliminating fuel costs and reducing operational expenses significantly.',
    challenges: [
      'Remote location with no grid access',
      'High water demand for large farm area',
      'Variable water requirements by season',
      'Durable system for outdoor agricultural environment',
      'Cost-effective solution for farming operations',
    ],
    executionMethods: [
      'Site-specific solar array sizing',
      'Submersible pump installation in deep well',
      'Automated control system with timers',
      'Water storage tank for continuous supply',
      'Weather-resistant mounting and protection',
    ],
    results: [
      '50kW solar array powering 10HP pump',
      '100% elimination of diesel fuel costs',
      '50,000 liters/day water pumping capacity',
      'Payback period of 4 years',
      'Zero operational fuel costs',
    ],
    technicalNotes: 'System includes 125 solar panels, 50kW inverter, 10HP submersible pump, 20,000L storage tank, automated controller, and weather monitoring. Designed for 20+ year operation in agricultural conditions.',
    gallery: [
      '/projects/agricultural-1.jpg',
      '/projects/agricultural-2.jpg',
      '/projects/agricultural-3.jpg',
    ],
  },
  {
    id: 'school-solar',
    name: 'Educational Institution Solar Project',
    location: 'University Campus',
    year: 2023,
    duration: '6 months',
    image: '/projects/school-1.jpg',
    video: '/projects/school-video.mp4',
    description: 'Comprehensive solar energy system for a university campus, covering multiple buildings and providing both cost savings and educational opportunities for students studying renewable energy.',
    challenges: [
      'Multiple building installations',
      'Academic calendar scheduling',
      'Educational integration requirements',
      'Aesthetic considerations for campus',
      'Long-term maintenance planning',
    ],
    executionMethods: [
      'Phased installation during summer break',
      'Educational displays and monitoring dashboards',
      'Integration with engineering curriculum',
      'Student involvement in monitoring',
      'Comprehensive documentation for education',
    ],
    results: [
      '3MW total capacity across 8 buildings',
      '70% reduction in campus electricity costs',
      'Educational resource for 5,000+ students',
      '1,200 tons CO2 reduction annually',
      'Enhanced university sustainability ranking',
    ],
    technicalNotes: 'Distributed system with 7,500 panels across 8 buildings, 30 string inverters, centralized monitoring platform, and educational dashboard displays. System includes real-time data logging for research purposes.',
    gallery: [
      '/projects/school-1.jpg',
      '/projects/school-2.jpg',
      '/projects/school-3.jpg',
      '/projects/school-4.jpg',
    ],
  },
  {
    id: 'hotel-solar',
    name: 'Resort Solar & Water Heating',
    location: 'Coastal Resort Area',
    year: 2022,
    duration: '10 months',
    image: '/projects/hotel-1.jpg',
    video: '/projects/hotel-video.mp4',
    description: 'Complete renewable energy solution for a luxury resort, including solar PV for electricity and solar water heating for guest rooms and facilities. This project demonstrates comprehensive solar integration in hospitality.',
    challenges: [
      'Maintaining luxury guest experience during installation',
      'High hot water demand for resort operations',
      'Coastal environment considerations',
      'Aesthetic integration with resort design',
      '24/7 operation requirements',
    ],
    executionMethods: [
      'Low-impact installation techniques',
      'Centralized solar water heating system',
      'Rooftop and ground-mounted solar arrays',
      'Seamless integration with existing systems',
      'Guest communication and education',
    ],
    results: [
      '2MW solar PV + 500kW thermal capacity',
      '65% reduction in energy costs',
      '80% of hot water from solar',
      'Enhanced sustainability credentials',
      'Positive guest feedback on green initiatives',
    ],
    technicalNotes: 'Hybrid system with 5,000 PV panels, 200 solar thermal collectors, centralized hot water storage (10,000L), heat exchangers, and backup systems. All installations designed for coastal salt-air environment.',
    gallery: [
      '/projects/hotel-1.jpg',
      '/projects/hotel-2.jpg',
      '/projects/hotel-3.jpg',
    ],
  },
]

