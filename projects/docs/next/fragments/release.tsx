import Card from './card'
import { ReactComponentProps } from '../meta/props/ReactComponent'
import { FC, Fragment } from 'react'
import clsx from 'clsx'

interface ReleaseCommitProps {
  category: string
  message: string
}

const ReleaseCommit: FC<ReleaseCommitProps> = ({ category, message }: ReleaseCommitProps): JSX.Element =>
  <Fragment>
    <div className="flex justify-start items-start">
      <mds-badge class="rounded-full text-brand-maggioli-03 bg-transparent border border-solid border-brand-maggioli-03">{ category }</mds-badge>
    </div>
    <mds-text typography="caption">{ message }</mds-text>
  </Fragment>

const ReleaseCommits: FC<ReactComponentProps> = ({ className, children }: ReactComponentProps): JSX.Element =>
  <div className={clsx('relative justify-between grid grid-cols-[auto_1fr] auto-rows-min gap-x-2 gap-y-1', className)}>
    { children }
  </div>

interface ReleasePreviewProps {
  children?: JSX.Element|JSX.Element[]
  commits: number
  date: string
  name: string
  version: string
}

const ReleasePreview: FC<ReleasePreviewProps> = ({
  children,
  commits,
  date,
  name,
  version,
}: ReleasePreviewProps): JSX.Element =>
  <Card className="grid-cols-4">
    <div className="grid auto-rows-min">
      <mds-text typography="h6" class="text-brand-maggioli-03">{ name }</mds-text>
      <mds-text typography="h6" class="text-adjust-tone-04"><b>{ version }</b></mds-text>
      <mds-text typography="label"><b>{ date }</b></mds-text>
    </div>
    <ReleaseCommits className="col-span-3">
      { children }
      <div className="col-start-2">
        <mds-badge variant="dark" tone="weak" class="rounded-full text-adjust-tone-05 border">+ { commits } commit</mds-badge>
      </div>
    </ReleaseCommits>
  </Card>

interface ReleaseDotSeparatorProps {
  last?: boolean
}

const ReleaseDotSeparator: FC<ReleaseDotSeparatorProps> = ({
  last = false,
}: ReleaseDotSeparatorProps): JSX.Element =>
  <div className="flex relative mobile:hidden">
    <div className="w-6 h-6 rounded-full bg-brand-maggioli-03 z-10 mt-4"></div>
    { !last && <div className="w-px absolute top-4 -bottom-12 bg-adjust-tone-01 left-1/2 -translate-x-1/2"></div> }
  </div>


interface ReleaseProps {
  children?: JSX.Element|JSX.Element[]
  commits: number
  date: string
  last?: boolean
  name: string
  version: string
}

const Release: FC<ReleaseProps> = ({
  children,
  date,
  last = false,
  version,
}: ReleaseProps): JSX.Element =>
  <div className="grid grid-cols-1 tablet:grid-cols-[1fr_2fr] gap-6 auto-rows-min">
    <div className="flex justify-between gap-4">
      <div className="mt-4">
        <mds-text><b>{ date }</b></mds-text>
        <mds-text typography="option" class="text-adjust-tone-05">3 giorni fa</mds-text>
      </div>
      <ReleaseDotSeparator last={last}/>
    </div>
    <Card className="tablet:col-start-2 tablet:col-end-3 grid gap-4">
      <div className="flex gap-2">
        <mds-text typography="h6" class="text-brand-maggioli-03">{ version }</mds-text>
      </div>
      <ReleaseCommits>
        { children }
      </ReleaseCommits>
    </Card>
  </div>


export {
  Release,
  ReleasePreview,
  ReleaseCommits,
  ReleaseCommit,
}
