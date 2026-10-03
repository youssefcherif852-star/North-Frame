# -*- coding: utf-8 -*-
"""North Frame's marks. One vocabulary: horizontal and vertical rules, 45 degree
diagonals, exact circles and true circular arcs. Every mark is drawn inside the
same 18-unit optical box on a 24-unit grid and centred on (12,12), so a grid of
them reads as one system instead of a set of drawings."""

# name -> (list of <path d> strings, list of <circle> tuples, list of filled paths)
MARKS = {
  # --- disciplines: these carry the brand's own frame-and-diagonal ---
  'web': (['M3 3h18v18H3z', 'M3 8h18', 'M7 13h10'], [], []),
  'social': (['M7.6 11 16.4 6.5', 'M7.6 13 16.4 17.5'],
             [(5.5, 12, 2.3), (18.5, 5.5, 2.3), (18.5, 18.5, 2.3)], []),
  'growth': (['M3 21h18', 'M3 21 21 3', 'M13 3h8v8'], [], []),
  'system': (['M3 3h13v13H3z', 'M8 8h13v13H8z'], [], ['M8 8h8v8H8z']),

  # --- principles: diagrams, not objects ---
  'clarity': (['M3 6h18v12H3z'], [(12, 12, 2.2)], []),
  'positioning': (['M3 12h18', 'M7 4h10v6H7z', 'M7 14h10v6H7z'], [], []),
  'conversion': (['M3 12h13', 'M12 8l4 4-4 4', 'M20 3v18'], [], []),
  'direction': (['M5 6h13', 'M15.5 3.5l2.5 2.5-2.5 2.5',
                 'M5 12h13', 'M15.5 9.5l2.5 2.5-2.5 2.5',
                 'M5 18h13', 'M15.5 15.5l2.5 2.5-2.5 2.5'], [], []),

}

def body(name, indent='    '):
    paths, circles, filled = MARKS[name]
    V = ' vector-effect="non-scaling-stroke"'
    out = [f'<path d="{d}"{V}/>' for d in paths]
    out += [f'<circle cx="{c[0]}" cy="{c[1]}" r="{c[2]}"{V}/>' for c in circles]
    out += [f'<path d="{d}" fill="currentColor" stroke="none"/>' for d in filled]
    return indent + ('\n' + indent).join(out)

def group(name, bx, by, bw=52, bh=36, scale=1.15):
    """Place a mark centred inside a diagram box."""
    size = 24 * scale
    x, y = bx + (bw - size) / 2, by + (bh - size) / 2
    paths, circles, filled = MARKS[name]
    V = ' vector-effect="non-scaling-stroke"'
    inner = ''.join(f'<path d="{d}"{V}/>' for d in paths)
    inner += ''.join(f'<circle cx="{c[0]}" cy="{c[1]}" r="{c[2]}"{V}/>' for c in circles)
    inner += ''.join(f'<path d="{d}" fill="currentColor" stroke="none"/>' for d in filled)
    return f'<g transform="translate({x:.1f} {y:.1f}) scale({scale})">{inner}</g>'
