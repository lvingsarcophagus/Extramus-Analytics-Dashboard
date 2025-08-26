import { Intern, Project, HousingUnit, DashboardMetrics, FilterOptions } from '@/types';
import { sampleInterns, sampleProjects, sampleHousingUnits } from './data/sample-data';

export function calculateDashboardMetrics(
  interns: Intern[] = sampleInterns,
  projects: Project[] = sampleProjects,
  housingUnits: HousingUnit[] = sampleHousingUnits,
  filters?: FilterOptions
): DashboardMetrics {
  // Apply filters if provided
  let filteredInterns = interns;
  let filteredProjects = projects;

  if (filters) {
    filteredInterns = interns.filter(intern => {
      const matchesDepartment = filters.departments.length === 0 || filters.departments.includes(intern.department);
      const matchesSeason = filters.seasons.length === 0 || filters.seasons.includes(intern.season);
      const matchesYear = filters.years.length === 0 || filters.years.includes(intern.year);
      const matchesTimeRange = intern.startDate >= filters.timeRange.start && intern.startDate <= filters.timeRange.end;
      
      return matchesDepartment && matchesSeason && matchesYear && matchesTimeRange;
    });

    filteredProjects = projects.filter(project => {
      const matchesTimeRange = project.startDate >= filters.timeRange.start && project.startDate <= filters.timeRange.end;
      return matchesTimeRange;
    });
  }

  const totalInterns = filteredInterns.length;
  const activeInterns = filteredInterns.filter(intern => intern.status === 'active').length;
  const completedProjects = filteredProjects.filter(project => project.status === 'completed').length;
  
  const totalHousingCapacity = housingUnits.reduce((sum, unit) => sum + unit.capacity, 0);
  const totalOccupancy = housingUnits.reduce((sum, unit) => sum + unit.currentOccupancy, 0);
  const housingOccupancy = totalHousingCapacity > 0 ? Math.round((totalOccupancy / totalHousingCapacity) * 100) : 0;

  // Department breakdown
  const departmentBreakdown = filteredInterns.reduce((acc, intern) => {
    acc[intern.department] = (acc[intern.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Seasonal trends
  const seasonalTrends = generateSeasonalTrends(filteredInterns, filteredProjects);

  // Nationality distribution
  const nationalityDistribution = filteredInterns.reduce((acc, intern) => {
    acc[intern.nationality] = (acc[intern.nationality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Gender distribution
  const genderDistribution = filteredInterns.reduce((acc, intern) => {
    acc[intern.gender] = (acc[intern.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalInterns,
    activeInterns,
    completedProjects,
    housingOccupancy,
    departmentBreakdown,
    seasonalTrends,
    nationalityDistribution,
    genderDistribution
  };
}

function generateSeasonalTrends(interns: Intern[], projects: Project[]) {
  const trends: Array<{ period: string; interns: number; projects: number }> = [];
  
  // Group by year and season
  const periods = new Map<string, { interns: number; projects: number }>();
  
  interns.forEach(intern => {
    const key = `${intern.year}-${intern.season}`;
    if (!periods.has(key)) {
      periods.set(key, { interns: 0, projects: 0 });
    }
    periods.get(key)!.interns++;
  });

  projects.forEach(project => {
    const year = project.startDate.getFullYear();
    const month = project.startDate.getMonth();
    let season = 'spring';
    if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'fall';
    else if (month >= 11 || month <= 1) season = 'winter';
    
    const key = `${year}-${season}`;
    if (!periods.has(key)) {
      periods.set(key, { interns: 0, projects: 0 });
    }
    periods.get(key)!.projects++;
  });

  // Convert to array and sort
  Array.from(periods.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([period, data]) => {
      trends.push({
        period: period.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        ...data
      });
    });

  return trends;
}

export function getAvailableFilters(interns: Intern[] = sampleInterns) {
  const departments = [...new Set(interns.map(intern => intern.department))];
  const seasons = [...new Set(interns.map(intern => intern.season))];
  const years = [...new Set(interns.map(intern => intern.year))].sort((a, b) => b - a);
  
  return { departments, seasons, years };
}

export function generateTimeRangeOptions() {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  return {
    thisMonth: {
      start: new Date(currentYear, now.getMonth(), 1),
      end: new Date(currentYear, now.getMonth() + 1, 0),
      period: 'month' as const
    },
    thisYear: {
      start: new Date(currentYear, 0, 1),
      end: new Date(currentYear, 11, 31),
      period: 'year' as const
    },
    lastYear: {
      start: new Date(currentYear - 1, 0, 1),
      end: new Date(currentYear - 1, 11, 31),
      period: 'year' as const
    },
    last12Months: {
      start: new Date(currentYear - 1, now.getMonth(), 1),
      end: now,
      period: 'year' as const
    }
  };
}
