import { Match, Prediction } from '../types';
import { WORLD_CUP_GROUPS, WORLD_CUP_MATCHES, TEAM_FLAGS } from '../constants';

interface TeamStats {
  name: string;
  flag: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  groupLetter: string;
}

// Map team names to their flags
const teamToFlagMap: Record<string, string> = {};
WORLD_CUP_GROUPS.forEach(g => {
  const groupLetter = g.name.replace('Grupo ', '');
  g.teams.forEach((t, idx) => {
    teamToFlagMap[t] = g.flags[idx];
  });
});

/**
 * Calculates group standings based on matches and/or predictions.
 */
export const calculateStandings = (
  groupName: string,
  teams: string[],
  flags: string[],
  matches: Match[],
  predictions: Prediction[],
  usePredictions: boolean
): TeamStats[] => {
  const groupLetter = groupName.replace('Grupo ', '');
  const standings: Record<string, TeamStats> = {};
  
  teams.forEach((team, idx) => {
    standings[team] = {
      name: team,
      flag: flags[idx],
      pj: 0, g: 0, e: 0, p: 0,
      gf: 0, gc: 0, dg: 0, pts: 0,
      groupLetter
    };
  });

  // Filter matches for this group (m1 to m72)
  const groupMatches = matches.filter(m => m.group.includes(groupName));

  groupMatches.forEach(match => {
    let hScore: number | undefined;
    let aScore: number | undefined;

    if (usePredictions) {
      const pred = predictions.find(p => p.matchId === match.id);
      if (pred && pred.homeScore !== '' && pred.awayScore !== '') {
        hScore = Number(pred.homeScore);
        aScore = Number(pred.awayScore);
      } else if (match.actualHomeScore !== undefined && match.actualAwayScore !== undefined) {
        hScore = match.actualHomeScore;
        aScore = match.actualAwayScore;
      }
    } else {
      if (match.actualHomeScore !== undefined && match.actualAwayScore !== undefined) {
        hScore = match.actualHomeScore;
        aScore = match.actualAwayScore;
      }
    }

    if (hScore !== undefined && aScore !== undefined && !isNaN(hScore) && !isNaN(aScore)) {
      const hTeam = match.homeTeam;
      const aTeam = match.awayTeam;

      if (standings[hTeam] && standings[aTeam]) {
        standings[hTeam].pj += 1;
        standings[aTeam].pj += 1;
        standings[hTeam].gf += hScore;
        standings[hTeam].gc += aScore;
        standings[aTeam].gf += aScore;
        standings[aTeam].gc += hScore;

        if (hScore > aScore) {
          standings[hTeam].g += 1;
          standings[hTeam].pts += 3;
          standings[aTeam].p += 1;
        } else if (hScore < aScore) {
          standings[aTeam].g += 1;
          standings[aTeam].pts += 3;
          standings[hTeam].p += 1;
        } else {
          standings[hTeam].e += 1;
          standings[aTeam].e += 1;
          standings[hTeam].pts += 1;
          standings[aTeam].pts += 1;
        }
      }
    }
  });

  return Object.values(standings).map(s => ({
    ...s,
    dg: s.gf - s.gc
  })).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });
};

/**
 * Resolves all knockout stage matches dynamically.
 */
export const resolveBracketMatches = (
  matches: Match[],
  predictions: Prediction[],
  usePredictions: boolean = false
): Match[] => {
  // 1. Calculate standings for all groups
  const standingsByGroup: Record<string, TeamStats[]> = {};
  WORLD_CUP_GROUPS.forEach(g => {
    standingsByGroup[g.name] = calculateStandings(g.name, g.teams, g.flags, matches, predictions, usePredictions);
  });

  // 2. Determine best 3rd-placed teams
  const allThirds: TeamStats[] = [];
  Object.keys(standingsByGroup).forEach(groupName => {
    const stands = standingsByGroup[groupName];
    if (stands.length >= 3) {
      allThirds.push(stands[2]); // 3rd team (index 2)
    }
  });

  // Sort 3rd-placed teams
  const qualifiedThirds = [...allThirds].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  }).slice(0, 8); // Top 8 third-placed teams qualify

  // 3. Assign 3rd-placed teams to their slots
  const slots = [
    { matchId: 'm75', prefers: ['A', 'B', 'C', 'D', 'F'] },
    { matchId: 'm78', prefers: ['C', 'D', 'F', 'G', 'H'] },
    { matchId: 'm79', prefers: ['C', 'E', 'F', 'H', 'I'] },
    { matchId: 'm80', prefers: ['E', 'H', 'I', 'J', 'K'] },
    { matchId: 'm81', prefers: ['A', 'E', 'H', 'I', 'J'] },
    { matchId: 'm82', prefers: ['B', 'E', 'F', 'I', 'J'] },
    { matchId: 'm85', prefers: ['E', 'F', 'G', 'I', 'J'] },
    { matchId: 'm88', prefers: ['D', 'E', 'I', 'J', 'L'] },
  ];

  const assignedGroups = new Set<string>();
  const slotAssignments: Record<string, { name: string; flag: string }> = {};

  // First pass: try to assign preferred matches
  slots.forEach(slot => {
    const availableMatchingTeam = qualifiedThirds.find(
      t => slot.prefers.includes(t.groupLetter) && !assignedGroups.has(t.groupLetter)
    );
    if (availableMatchingTeam) {
      assignedGroups.add(availableMatchingTeam.groupLetter);
      slotAssignments[slot.matchId] = {
        name: availableMatchingTeam.name,
        flag: availableMatchingTeam.flag
      };
    }
  });

  // Second pass: fill any remaining slots with leftover qualified third-placed teams
  slots.forEach(slot => {
    if (!slotAssignments[slot.matchId]) {
      const leftoverTeam = qualifiedThirds.find(t => !assignedGroups.has(t.groupLetter));
      if (leftoverTeam) {
        assignedGroups.add(leftoverTeam.groupLetter);
        slotAssignments[slot.matchId] = {
          name: leftoverTeam.name,
          flag: leftoverTeam.flag
        };
      }
    }
  });

  // 4. Create a copy of matches to resolve
  const resolvedMatches: Match[] = matches.map(m => ({ ...m }));

  // Helper to find a resolved team name and flag by placeholder string
  const resolvePlaceholder = (placeholder: string, matchId: string): { name: string; flag: string } | null => {
    const trimmed = placeholder.trim();
    
    // Group positions (e.g. "1° Grupo A")
    const groupPosMatch = trimmed.match(/^([123])°\s+Grupo\s+([A-L])$/);
    if (groupPosMatch) {
      const pos = parseInt(groupPosMatch[1], 10);
      const groupLetter = groupPosMatch[2];
      const stands = standingsByGroup[`Grupo ${groupLetter}`];
      if (stands && stands[pos - 1]) {
        return { name: stands[pos - 1].name, flag: stands[pos - 1].flag };
      }
    }

    // Third place slots (e.g. "3° A/B/C/D/F")
    if (trimmed.startsWith('3°')) {
      const assigned = slotAssignments[matchId];
      if (assigned) return assigned;
    }

    // Winners/Losers of previous matches (e.g. "Ganador 73", "Perdedor 101")
    const matchRefMatch = trimmed.match(/^(Ganador|Perdedor)\s+(\d+)$/);
    if (matchRefMatch) {
      const type = matchRefMatch[1]; // "Ganador" or "Perdedor"
      const refIdNum = matchRefMatch[2];
      const refMatchId = `m${refIdNum}`;
      
      const targetMatch = resolvedMatches.find(m => m.id === refMatchId);
      if (targetMatch) {
        // We only resolve if the target match is already fully resolved (not a placeholder name)
        const isHomePlaceholder = targetMatch.homeTeam.includes('Grupo') || targetMatch.homeTeam.includes('Ganador') || targetMatch.homeTeam.includes('Perdedor');
        const isAwayPlaceholder = targetMatch.awayTeam.includes('Grupo') || targetMatch.awayTeam.includes('Ganador') || targetMatch.awayTeam.includes('Perdedor');
        
        if (!isHomePlaceholder && !isAwayPlaceholder) {
          // Determine winner or loser
          let hScore: number | undefined;
          let aScore: number | undefined;

          if (usePredictions) {
            const pred = predictions.find(p => p.matchId === refMatchId);
            if (pred && pred.homeScore !== '' && pred.awayScore !== '') {
              hScore = Number(pred.homeScore);
              aScore = Number(pred.awayScore);
            } else if (targetMatch.actualHomeScore !== undefined && targetMatch.actualAwayScore !== undefined) {
              hScore = targetMatch.actualHomeScore;
              aScore = targetMatch.actualAwayScore;
            }
          } else {
            if (targetMatch.actualHomeScore !== undefined && targetMatch.actualAwayScore !== undefined) {
              hScore = targetMatch.actualHomeScore;
              aScore = targetMatch.actualAwayScore;
            }
          }

          if (hScore !== undefined && aScore !== undefined) {
            const homeWon = hScore >= aScore; // Default tie-breaker to home team if equal
            if (type === 'Ganador') {
              return homeWon 
                ? { name: targetMatch.homeTeam, flag: targetMatch.homeFlag }
                : { name: targetMatch.awayTeam, flag: targetMatch.awayFlag };
            } else { // Perdedor
              return homeWon 
                ? { name: targetMatch.awayTeam, flag: targetMatch.awayFlag }
                : { name: targetMatch.homeTeam, flag: targetMatch.homeFlag };
            }
          }
        }
      }
    }

    return null;
  };

  // 5. Run multiple passes to resolve cascading knockout stages
  // (Since matches are chronologically ordered, 1 pass from m73 to m104 is mathematically sufficient,
  // but running 3 passes handles any complex lookups robustly)
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < resolvedMatches.length; i++) {
      const match = resolvedMatches[i];
      
      // We only resolve knockout matches
      if (match.group.includes('Grupo')) continue;

      // Try resolving home team
      const isHomePlaceholder = match.homeTeam.includes('Grupo') || match.homeTeam.includes('Ganador') || match.homeTeam.includes('Perdedor') || match.homeTeam.includes('3°');
      if (isHomePlaceholder) {
        const resolvedHome = resolvePlaceholder(match.homeTeam, match.id);
        if (resolvedHome) {
          match.homeTeam = resolvedHome.name;
          match.homeFlag = resolvedHome.flag;
        }
      }

      // Try resolving away team
      const isAwayPlaceholder = match.awayTeam.includes('Grupo') || match.awayTeam.includes('Ganador') || match.awayTeam.includes('Perdedor') || match.awayTeam.includes('3°');
      if (isAwayPlaceholder) {
        const resolvedAway = resolvePlaceholder(match.awayTeam, match.id);
        if (resolvedAway) {
          match.awayTeam = resolvedAway.name;
          match.awayFlag = resolvedAway.flag;
        }
      }
    }
  }

  return resolvedMatches;
};
