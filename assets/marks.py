# -*- coding: utf-8 -*-
"""North Frame's marks. One vocabulary: horizontal and vertical rules, 45 degree
diagonals, exact circles and true circular arcs. Every mark is drawn inside the
same 18-unit optical box on a 24-unit grid and centred on (12,12), so a grid of
them reads as one system instead of a set of drawings."""

# name -> (list of <path d> strings, list of <circle> tuples, list of filled paths)
MARKS = {
  # --- disciplines: these carry the brand's own frame-and-diagonal ---
  'web': (['M3 3h18v18H3z', 'M3 7h18', 'M3 21 17 7'], [], []),
  'social': (['M3 3h18v18H3z', 'M9 3v18M15 3v18M3 9h18M3 15h18'], [], ['M9 9h6v6H9z']),
  'growth': (['M3 21h18', 'M3 21 21 3', 'M13 3h8v8'], [], []),
  'system': (['M12 3v6M12 15v6M3 12h6M15 12h6'], [], ['M9 9h6v6H9z']),

  # --- principles: diagrams, not objects ---
  'clarity': (['M3 6h18v12H3z'], [(12, 12, 2.2)], []),
  'positioning': (['M3 12h18', 'M7 4h10v6H7z', 'M7 14h10v6H7z'], [], []),
  'conversion': (['M3 12h13', 'M12 8l4 4-4 4', 'M20 3v18'], [], []),
  'direction': (['M5 6h13', 'M15.5 3.5l2.5 2.5-2.5 2.5',
                 'M5 12h13', 'M15.5 9.5l2.5 2.5-2.5 2.5',
                 'M5 18h13', 'M15.5 15.5l2.5 2.5-2.5 2.5'], [], []),

  # --- hospitality ---
  'cafe': (['M5 6h11l-1.2 9.5H6.2z', 'M16 8.2a3.4 3.4 0 0 1 0 6.4', 'M3 18.5h18'], [], []),
  'restaurant': (['M4 3v5M6.5 3v5M9 3v5', 'M4 8h5', 'M6.5 8v13',
                  'M16.5 3l3 3v7h-3z', 'M18 13v8'], [], []),
  'pizzeria': (['M3 7A17.5 17.5 0 0 1 21 7L12 20z', 'M5 9.6A16 16 0 0 1 19 9.6'],
               [(9.6, 12, 1.1), (14.4, 11.7, 1.1), (12, 15.6, 1.1)], []),
  'bakery': (['M3 13a9 9 0 0 1 18 0v6H3z', 'M8 10.5 6 12.5M12.5 9.7 10.5 11.7M17 10.5 15 12.5'], [], []),
  'patisserie': (['M4 16h16v4.5H4z', 'M6 11.5h12v4.5H6z', 'M8 7h8v4.5H8z'],
                 [(12, 4.5, 1.5)], []),
  'hotel': (['M4 3h16v18H4z', 'M4 8h16M4 13h16', 'M10 21v-4.5h4V21'], [], []),
  'boutique': (['M11 12h10', 'M16 12v5M19.5 12v5'], [(7, 12, 4)], []),
  'lounge': (['M3 5h18l-9 9z', 'M12 14v6', 'M7 20.5h10'], [(9, 7.8, 1.2)], []),
  'rooftop': (['M8 21V11h8v10', 'M5 11h14', 'M7.5 7a4.5 4.5 0 0 1 9 0z', 'M12 7v4'], [], []),
  'fastfood': (['M4 12a8 8 0 0 1 16 0z', 'M4.5 15h15', 'M4.5 17.5h15v3h-15z'], [], []),
  'sushi': (['M3 17.5h18'],
            [(7.6, 10.5, 4.2), (7.6, 10.5, 1.5), (16.8, 12, 3.4), (16.8, 12, 1.2)], []),
  'dessert': (['M7.6 10.5 12 21 16.4 10.5'], [(12, 8, 5)], []),
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
