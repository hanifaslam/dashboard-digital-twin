import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ProfileContentLayoutProps {
  children: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode
  afterTitle?: React.ReactNode
  title?: React.ReactNode
  titleTrailing?: React.ReactNode
  titleClassName?: string
}

export default function ProfileContentLayout({
  children,
  leading,
  trailing,
  afterTitle,
  title,
  titleTrailing,
  titleClassName = 'text-2xl font-semibold text-foreground'
}: ProfileContentLayoutProps) {
  return (
    <Card className="p-6 shadow-none">
      {(title || leading || trailing) && (
        <header className="-mb-2">
          {title &&
            (titleTrailing ? (
              <div className="flex items-center justify-between">
                <h1 className={titleClassName}>{title}</h1>
                <div className="ml-4">{titleTrailing}</div>
              </div>
            ) : (
              <h1 className={titleClassName}>{title}</h1>
            ))}
          <Separator className="mt-4" />
          {afterTitle && <div className="mt-4">{afterTitle}</div>}
          {(leading || trailing) && (
            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="w-full md:flex-1">{leading}</div>
              {trailing}
            </div>
          )}
        </header>
      )}

      <main>{children}</main>
    </Card>
  )
}
