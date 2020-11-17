import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'
import H2 from '@Typography/H2/H2'
import H4 from '@Typography/H4/H4'
import Hr from '@UI/Hr/Hr'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Detail from '@Typography/Detail/Detail'
import BenchmarkBar from '@Content/BenchmarkBar/BenchmarkBar'
import Row from '@Layout/Row/Row'
import Icon from '@Design/Icon/Icon'

const getProgress = subTasks => {
  let completed = 0
  subTasks.map(subTask => {
    completed = subTask.done ? completed + 1 : completed
  })
  return completed * 100 / subTasks.length
}

const RoadmapChecklistTasks = props =>
  <Grid>
    { props.checklist.map(element => {
      if (element.title.toLowerCase() === props.filter.toLowerCase()) {
        return <Grid gutter="small">
          <H2>{ element.title }</H2>
          <Paragraph>{ element.description }</Paragraph>
          { element.children.map((section, sectionIndex) =>
            <Grid key={sectionIndex} gutter="small">
              <H4>{section.title}</H4>
              <Detail>{section.description}</Detail>
              { section.children.map((task, taskIndex) =>
                <Grid gutter="none">
                  <Row key={taskIndex}>
                    <Icon name={task.done ? 'form-checkbox-checked' : 'form-checkbox-unchecked'}/>
                    <Detail><b>{task.title}</b></Detail>
                  </Row>
                  <Detail>{task.description}</Detail>
                </Grid>,
              ) }
              <Hr/>
            </Grid>,
          ) }
          <Hr className="background-color-adjust-tone-18"/>
        </Grid>
      }
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
  <Fragment>
    { props.tasks.map((task, index) => {
      return <BenchmarkBar key={index} autoColor={true} progress={getProgress(task.children)} size="xsmall"><H4>{task.title}</H4></BenchmarkBar>
    })}
  </Fragment>

RoadmapMainChecklistTasks.propTypes = {
  className: PropTypes.string,
  tasks: PropTypes.any,
}

RoadmapMainChecklistTasks.defaultProps = {
  className: '',
}

const RoadmapMainChecklist = props =>
  <Grid>
    { props.checklist.map(element => {
      return <Grid gutter="small">
        <H2>{ element.title }</H2>
        <Paragraph>{ element.description }</Paragraph>
        <Grid template="auto-fill-medium" gutter="large">
          <RoadmapMainChecklistTasks tasks={element.children} />
        </Grid>
        <Hr className="background-color-adjust-tone-18"/>
      </Grid>
    })}
  </Grid>

RoadmapMainChecklist.propTypes = {
  className: PropTypes.string,
  checklist: PropTypes.any,
}

RoadmapMainChecklist.defaultProps = {
  className: '',
}

export default RoadmapMainChecklist

export {
  RoadmapChecklistTasks,
}
