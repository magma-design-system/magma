import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'
import H2 from '@Typography/H2/H2'
import H4 from '@Typography/H4/H4'
import H6 from '@Typography/H6/H6'
import Hr from '@UI/Hr/Hr'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Detail from '@Typography/Detail/Detail'
import Card from '@Layout/Card/Card'
import BenchmarkBar from '@Content/BenchmarkBar/BenchmarkBar'
import Row from '@Layout/Row/Row'
import { Link } from 'gatsby'
import Icon from '@Design/Icon/Icon'
import Button from '@UI/Button/Button'
import Tag from '@UI/Tag/Tag'
import ExternalLink from '@UI/ExternalLink/ExternalLink'

const getProgress = subTasks => {
  return subTasks.filter(subTask => subTask.done !== false).length * 100 / subTasks.length
}

const RoadmapChecklistTasks = props =>
  <Grid>
    { props.checklist.map(element => {
      if (element.title.toLowerCase() === props.filter.toLowerCase()) {
        return <Grid gutter="small">
          <Paragraph>{ element.description }</Paragraph>
          { element.children.map((section, sectionIndex) =>
            <Grid key={sectionIndex} gutter="normal">
              <Hr className="background-color-adjust-tone-18"/>
              <H4>{section.title}</H4>
              <Detail>{section.description}</Detail>
              { section.children.map((task, taskIndex) =>
                <Grid gutter="xsmall" key={taskIndex}>
                  <Row>
                    <Icon className={task.done ? 'color-status-success-08' : 'color-adjust-tone-16'} name="status-success"/>
                    <Detail className={task.done ? '' : 'color-adjust-tone-08'}><b>{task.title}</b></Detail>
                  </Row>
                  <Detail>{task.description}</Detail>
                  <Grid gutter="xsmall" template="auto-fill-medium">
                    {task.done && task.done !== true && <Button href={task.done} icon="document-book" size="small">Vai al contenuto</Button> }
                    {task.done && task.done === true && <Tag icon="warning" chip size="small" status="warning">Da documentare</Tag> }
                    {task.storybook && <Button href={`https://design-system.maggiolicloud.it/storybook/?path=/story/${task.storybook}`} icon="document-book" size="small" variant="secondary">Storybook</Button> }
                  </Grid>
                </Grid>,
              ) }
              {section.references && <H6>Riferimenti esterni</H6>}
              <Grid gutter="none">
                { section.references.map((reference, referenceIndex) =>
                  <span><ExternalLink key={referenceIndex} href={reference.href}>{reference.title}</ExternalLink></span>,
                ) }
              </Grid>
            </Grid>,
          ) }
        </Grid>
      }
      return null
    }) }
  </Grid>

RoadmapChecklistTasks.propTypes = {
  className: PropTypes.string,
  filter: PropTypes.string,
  checklist: PropTypes.any,
}

RoadmapChecklistTasks.defaultProps = {
  className: '',
  filter: 'design language',
}

const RoadmapMainChecklistTasks = props =>
  <Grid template="auto-fill-large" gutter="large">
    { props.tasks.map((task, index) => {
      return <Link key={index} to={`${props.pagePath}/${props.category.toLowerCase().replace(' ', '-')}/`}>
        <Card boxShadow="box--interactive" gutter="xsmall" padding="padding-small" rows="fit-vertically">
          <BenchmarkBar progressText={false} autoColor={true} progress={getProgress(task.children)} size="xsmall"><H4>{task.title}</H4></BenchmarkBar>
          <Grid template="auto-fill-icon" gutter="none">
            { task.children.sort((x, y) => { if (x.done === y.done) { return 0 } else if (x.done) { return -1 } return 1 }).map((subTask, index) =>
              <Icon key={index} name="status-success" className={`${subTask.done ? 'color-adjust-tone-06' : 'color-adjust-tone-16'}`}/>,
            )}
          </Grid>
        </Card>
      </Link>
    })}
  </Grid>

RoadmapMainChecklistTasks.propTypes = {
  category: PropTypes.string,
  pagePath: PropTypes.string,
  className: PropTypes.string,
  tasks: PropTypes.any,
}

RoadmapMainChecklistTasks.defaultProps = {
  className: '',
}

const RoadmapMainChecklist = props =>
  <Grid>
    { props.checklist.map((element, index) => {
      return <Grid key={index} gutter="small">
        {index !== 0 && <Hr className="background-color-adjust-tone-18"/>}
        <H2>{ element.title }</H2>
        <Paragraph>{ element.description }</Paragraph>
        <RoadmapMainChecklistTasks pagePath={props.pagePath} tasks={element.children} category={element.title}/>
      </Grid>
    })}
  </Grid>

RoadmapMainChecklist.propTypes = {
  className: PropTypes.string,
  checklist: PropTypes.any,
  pagePath: PropTypes.string,
}

RoadmapMainChecklist.defaultProps = {
  className: '',
}

export default RoadmapMainChecklist

export {
  RoadmapChecklistTasks,
}
