/**
 * recommendationEngine.js
 * Calculates an affinity score between the current user and alumni to recommend connections.
 */

export function getRecommendedAlumni(currentUser, allAlumni, limit = 5) {
  if (!currentUser || !allAlumni || !Array.isArray(allAlumni)) return []

  const scoredAlumni = allAlumni.map((alumnus) => {
    let score = 0

    // 1. Department/Branch Match (+3)
    if (currentUser.branch && alumnus.branch && currentUser.branch.toLowerCase() === alumnus.branch.toLowerCase()) {
      score += 3
    }

    // 2. Company/Domain Match (+2)
    if (currentUser.company && alumnus.company && currentUser.company.toLowerCase() === alumnus.company.toLowerCase()) {
      score += 2
    }

    // 3. Shared Skills (+1 per match)
    if (currentUser.skills && alumnus.skills) {
      const mySkills = currentUser.skills.toLowerCase().split(',').map(s => s.trim())
      const theirSkills = alumnus.skills.toLowerCase().split(',').map(s => s.trim())
      
      const commonSkills = mySkills.filter(skill => theirSkills.includes(skill))
      score += commonSkills.length
    }

    // 4. Shared Interests (+1 per match)
    if (currentUser.interests && alumnus.interests) {
      const myInterests = currentUser.interests.toLowerCase().split(',').map(i => i.trim())
      const theirInterests = alumnus.interests.toLowerCase().split(',').map(i => i.trim())
      
      const commonInterests = myInterests.filter(interest => theirInterests.includes(interest))
      score += commonInterests.length
    }

    // 5. Batch Proximity (+1 if within 2 years)
    if (currentUser.graduation_year && alumnus.graduation_year) {
      const diff = Math.abs(parseInt(currentUser.graduation_year) - parseInt(alumnus.graduation_year))
      if (diff <= 2) {
        score += 1
      }
    }

    return { ...alumnus, recommendationScore: score }
  })

  // Sort by score descending
  scoredAlumni.sort((a, b) => b.recommendationScore - a.recommendationScore)

  // Return top N
  return scoredAlumni.slice(0, limit)
}
