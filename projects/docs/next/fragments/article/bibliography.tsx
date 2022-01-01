import clsx from 'clsx'
import { FC } from 'react'
import { ArticleSeparator as Separator } from '../separator'

type ComponentProps = {
  className?: string
}

const ArticleBibliography: FC<ComponentProps> = ({ className }): JSX.Element =>
  <div className={clsx('flex flex-col gap-8 pt-8 backdrop-blur-md backdrop-saturate-200 bg-adjust-tone-10/80 -mx-6 px-6', className)}>
    <Separator className='mt-4 -mx-6-'/>
    <div className="grid gap-4">
      <mds-text typography="h5">Fonti</mds-text>
      <div className="grid">
        <mds-bibliography
          author="Mario Rossi"
          date="2021-03-21"
          name="Grosso guaio a Chinatown"
          url="https://www.maggioli.com"
        />
        <mds-bibliography
          author="'Mike Thorton', 'Emily Blake'"
          date="2019-08-03"
          name="Come Fare l'Internet"
          publisher="Decca Libri"
          url="https://www.maggioli.com"
        />
      </div>
    </div>
  </div>

export default ArticleBibliography
