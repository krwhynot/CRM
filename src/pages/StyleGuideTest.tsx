import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { PriorityBadge } from '@/components/ui/new/PriorityBadge'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/ui/new/PageHeader'
import { cn } from '@/lib/utils'
import {
  semanticSpacing,
  semanticTypography,
  semanticColors,
  fontWeight,
  semanticRadius,
} from '@/styles/tokens'

export function StyleGuideTest() {
  return (
    <PageContainer>
      <PageHeader title="Style Guide Test Page" className={semanticSpacing.sectionGap} />

      <div className={`grid grid-cols-2 ${semanticSpacing.gap.xl}`}>
        <div>
          <h2 className={`${semanticSpacing.stack.md} ${semanticTypography.h3}`}>Current Style</h2>
          {/* Old components will go here */}
          <div className={semanticSpacing.stack.md}>
            <p className={`${semanticTypography.body} text-muted-foreground`}>
              Original components:
            </p>
            <div className={semanticSpacing.inline.sm}>
              <Button>Save Organization</Button>
              <Button variant="secondary">Cancel</Button>
              <Button variant="destructive">Delete</Button>
              <Button variant="ghost">Edit</Button>
            </div>
            <Card className={semanticSpacing.section.md}>
              <CardHeader>
                <CardTitle>Organization Summary</CardTitle>
                <CardDescription>Key metrics and data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`${semanticTypography.h1} ${fontWeight.bold}`}>247</p>
                <p
                  className={`${semanticSpacing.topGap.xs} ${semanticTypography.caption} text-muted-foreground`}
                >
                  Active accounts
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className={`${semanticSpacing.stack.md} ${semanticTypography.h3}`}>
            Consolidated Style
          </h2>
          {/* Consolidated components after refactoring */}
          <div className={semanticSpacing.stack.md}>
            <p className={`${semanticTypography.body} text-muted-foreground`}>
              Components after consolidation:
            </p>
            <div className={semanticSpacing.inline.sm}>
              <Button>Save Organization</Button>
              <Button variant="secondary">Cancel</Button>
              <Button variant="destructive">Delete</Button>
              <Button variant="ghost">Edit</Button>
            </div>
            <div className={`${semanticSpacing.section.md} ${semanticSpacing.stack.sm}`}>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
            <Card className={semanticSpacing.section.md}>
              <CardHeader>
                <CardTitle>Organization Summary</CardTitle>
                <CardDescription>Key metrics and data with semantic tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`${semanticTypography.h1} ${fontWeight.bold} text-primary`}>247</p>
                <p
                  className={`${semanticSpacing.topGap.xs} ${semanticTypography.caption} text-muted-foreground`}
                >
                  Active accounts
                </p>
              </CardContent>
            </Card>
            <div className={`${semanticSpacing.section.md} ${semanticSpacing.stack.xs}`}>
              <p className={`${semanticTypography.caption} text-muted-foreground`}>
                Priority Badges:
              </p>
              <div className={semanticSpacing.inline.sm}>
                <PriorityBadge priority="A+" />
                <PriorityBadge priority="A" />
                <PriorityBadge priority="B" />
                <PriorityBadge priority="C" />
                <PriorityBadge priority="D" />
              </div>
              <div className={semanticSpacing.inline.sm}>
                <PriorityBadge priority="A+" showIcon={false} />
                <PriorityBadge priority="A" showIcon={false} />
                <PriorityBadge priority="B" showIcon={false} />
              </div>
            </div>
            <div className={`${semanticSpacing.section.md} ${semanticSpacing.stack.sm}`}>
              <p className={`${semanticTypography.caption} text-success`}>
                Components successfully consolidated!
              </p>
              <p className={`${semanticTypography.caption} text-muted-foreground`}>
                ✅ Button components merged
                <br />
                ✅ Semantic color tokens implemented
                <br />✅ Atomic design templates created
              </p>
            </div>

            {/* New Design System Color Tokens Demo */}
            <div className={`${semanticSpacing.section.lg} ${semanticSpacing.stack.md}`}>
              <h3 className={semanticTypography.h4}>New Design System Color Tokens</h3>

              <div className={semanticSpacing.inline.sm}>
                <p className={`${semanticTypography.caption} text-muted-foreground`}>
                  Organization Types:
                </p>
                <div className={`flex flex-wrap ${semanticSpacing.gap.sm}`}>
                  <div
                    className={`flex items-center ${semanticSpacing.gap.sm} ${semanticRadius.lg} border ${semanticSpacing.compact}`}
                  >
                    <div
                      className={`size-4 ${semanticRadius.default} bg-organization-customer`}
                    ></div>
                    <span
                      className={cn(
                        semanticSpacing.minimalY,
                        semanticRadius.default,
                        'bg-organization-customer',
                        semanticSpacing.compactX,
                        semanticTypography.caption,
                        fontWeight.medium,
                        'text-organization-customer-foreground'
                      )}
                    >
                      Customer
                    </span>
                  </div>
                  <div
                    className={`flex items-center ${semanticSpacing.gap.sm} ${semanticRadius.lg} border ${semanticSpacing.compact}`}
                  >
                    <div
                      className={`size-4 ${semanticRadius.default} bg-organization-distributor`}
                    ></div>
                    <span
                      className={cn(
                        semanticSpacing.minimalY,
                        semanticRadius.default,
                        'bg-organization-distributor',
                        semanticSpacing.compactX,
                        semanticTypography.caption,
                        fontWeight.medium,
                        'text-organization-distributor-foreground'
                      )}
                    >
                      Distributor
                    </span>
                  </div>
                  <div
                    className={`flex items-center ${semanticSpacing.gap.sm} ${semanticRadius.lg} border ${semanticSpacing.compact}`}
                  >
                    <div
                      className={`size-4 ${semanticRadius.default} bg-organization-principal`}
                    ></div>
                    <span
                      className={cn(
                        semanticSpacing.minimalY,
                        semanticRadius.default,
                        'bg-organization-principal',
                        semanticSpacing.compactX,
                        semanticTypography.caption,
                        fontWeight.medium,
                        'text-organization-principal-foreground'
                      )}
                    >
                      Principal
                    </span>
                  </div>
                  <div
                    className={`flex items-center ${semanticSpacing.gap.sm} ${semanticRadius.lg} border ${semanticSpacing.compact}`}
                  >
                    <div
                      className={`size-4 ${semanticRadius.default} bg-organization-supplier`}
                    ></div>
                    <span
                      className={cn(
                        semanticSpacing.minimalY,
                        semanticRadius.default,
                        'bg-organization-supplier',
                        semanticSpacing.compactX,
                        semanticTypography.caption,
                        fontWeight.medium,
                        'text-organization-supplier-foreground'
                      )}
                    >
                      Supplier
                    </span>
                  </div>
                </div>
              </div>

              <div className={semanticSpacing.inline.sm}>
                <p className={`${semanticTypography.caption} text-muted-foreground`}>
                  Market Segments:
                </p>
                <div className={`flex flex-wrap ${semanticSpacing.gap.sm}`}>
                  <div
                    className={`flex items-center ${semanticSpacing.gap.sm} ${semanticRadius.lg} border ${semanticSpacing.compact}`}
                  >
                    <div className={`size-4 ${semanticRadius.default} bg-segment-restaurant`}></div>
                    <span
                      className={cn(
                        semanticSpacing.minimalY,
                        semanticRadius.default,
                        'bg-segment-restaurant',
                        semanticSpacing.compactX,
                        semanticTypography.caption,
                        fontWeight.medium,
                        'text-segment-restaurant-foreground'
                      )}
                    >
                      Restaurant
                    </span>
                  </div>
                  <div
                    className={`flex items-center ${semanticSpacing.gap.sm} ${semanticRadius.lg} border ${semanticSpacing.compact}`}
                  >
                    <div className={`size-4 ${semanticRadius.default} bg-segment-healthcare`}></div>
                    <span
                      className={cn(
                        semanticSpacing.minimalY,
                        semanticRadius.default,
                        'bg-segment-healthcare',
                        semanticSpacing.compactX,
                        semanticTypography.caption,
                        fontWeight.medium,
                        'text-segment-healthcare-foreground'
                      )}
                    >
                      Healthcare
                    </span>
                  </div>
                  <div
                    className={`flex items-center ${semanticSpacing.gap.sm} ${semanticRadius.lg} border ${semanticSpacing.compact}`}
                  >
                    <div className={`size-4 ${semanticRadius.default} bg-segment-education`}></div>
                    <span
                      className={cn(
                        semanticSpacing.minimalY,
                        semanticRadius.default,
                        'bg-segment-education',
                        semanticSpacing.compactX,
                        semanticTypography.caption,
                        fontWeight.medium,
                        'text-segment-education-foreground'
                      )}
                    >
                      Education
                    </span>
                  </div>
                </div>
              </div>

              <div className={semanticSpacing.inline.sm}>
                <p className={`${semanticTypography.caption} text-muted-foreground`}>
                  Priority System (Updated):
                </p>
                <div className={`flex flex-wrap ${semanticSpacing.gap.sm}`}>
                  <div
                    className={`flex items-center ${semanticSpacing.gap.sm} ${semanticRadius.lg} border ${semanticSpacing.compact}`}
                  >
                    <div className={`size-4 ${semanticRadius.default} bg-priority-a-plus`}></div>
                    <span
                      className={cn(
                        semanticSpacing.minimalY,
                        semanticRadius.default,
                        'bg-priority-a-plus',
                        semanticSpacing.compactX,
                        semanticTypography.caption,
                        fontWeight.medium,
                        'text-priority-a-plus-foreground'
                      )}
                    >
                      A+ Priority
                    </span>
                  </div>
                  <div
                    className={`flex items-center ${semanticSpacing.gap.sm} ${semanticRadius.lg} border ${semanticSpacing.compact}`}
                  >
                    <div className={`size-4 ${semanticRadius.default} bg-priority-a`}></div>
                    <span
                      className={cn(
                        semanticSpacing.minimalY,
                        semanticRadius.default,
                        'bg-priority-a',
                        semanticSpacing.compactX,
                        semanticTypography.caption,
                        fontWeight.medium,
                        'text-priority-a-foreground'
                      )}
                    >
                      A Priority
                    </span>
                  </div>
                  <div
                    className={`flex items-center ${semanticSpacing.gap.sm} ${semanticRadius.lg} border ${semanticSpacing.compact}`}
                  >
                    <div className={`size-4 ${semanticRadius.default} bg-priority-b`}></div>
                    <span
                      className={cn(
                        semanticSpacing.minimalY,
                        semanticRadius.default,
                        'bg-priority-b',
                        semanticSpacing.compactX,
                        semanticTypography.caption,
                        fontWeight.medium,
                        'text-priority-b-foreground'
                      )}
                    >
                      B Priority
                    </span>
                  </div>
                  <div
                    className={`flex items-center ${semanticSpacing.gap.sm} ${semanticRadius.lg} border ${semanticSpacing.compact}`}
                  >
                    <div className={`size-4 ${semanticRadius.default} bg-priority-c`}></div>
                    <span
                      className={cn(
                        semanticSpacing.minimalY,
                        semanticRadius.default,
                        'bg-priority-c',
                        semanticSpacing.compactX,
                        semanticTypography.caption,
                        fontWeight.medium,
                        'text-priority-c-foreground'
                      )}
                    >
                      C Priority
                    </span>
                  </div>
                  <div
                    className={`flex items-center ${semanticSpacing.gap.sm} ${semanticRadius.lg} border ${semanticSpacing.compact}`}
                  >
                    <div className={`size-4 ${semanticRadius.default} bg-priority-d`}></div>
                    <span
                      className={cn(
                        semanticSpacing.minimalY,
                        semanticRadius.default,
                        'bg-priority-d',
                        semanticSpacing.compactX,
                        semanticTypography.caption,
                        fontWeight.medium,
                        'text-priority-d-foreground'
                      )}
                    >
                      D Priority
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default StyleGuideTest
