import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  FormField,
  Form,
  TextArea
} from 'semantic-ui-react'

import { createBug, deleteBug, getBugs, patchBug } from '../api/bugs-api'
import Auth from '../auth/Auth'
import { Bug } from '../types/Bug'

interface BugsProps {
  auth: Auth
  history: History
}

interface BugsState {
  bugs: Bug[]
  newBugName: string
  messageDetials: string
  loadingBugs: boolean
}

export class Bugs extends React.PureComponent<BugsProps, BugsState> {
  state: BugsState = {
    bugs: [],
    newBugName: '',
    messageDetials: '',
    loadingBugs: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBugName: event.target.value })
  }

  onEditButtonClick = (bugId: string) => {
    this.props.history.push(`/bugs/${bugId}/edit`)
  }

  onBugCreate = async() => {
    try {
      const dueDate = this.calculateDueDate()
      const newBug = await createBug(this.props.auth.getIdToken(), {
        name: this.state.newBugName,
        dueDate,
        message: this.state.messageDetials,
      })
      this.setState({
        bugs: [...this.state.bugs, newBug],
        newBugName: ''
      })
    } catch {
      alert('Bug creation failed')
    }
  }

  onBugDelete = async (bugId: string) => {
    try {
      await deleteBug(this.props.auth.getIdToken(), bugId)
      this.setState({
        bugs: this.state.bugs.filter(bug => bug.bugId != bugId)
      })
    } catch {
      alert('Bug deletion failed')
    }
  }

  onBugCheck = async (pos: number) => {
    try {
      const bug = this.state.bugs[pos]
      await patchBug(this.props.auth.getIdToken(), bug.bugId, {
        name: bug.name,
        dueDate: bug.dueDate,
        done: !bug.done
      })
      this.setState({
        bugs: update(this.state.bugs, {
          [pos]: { done: { $set: !bug.done } }
        })
      })
    } catch {
      alert('Bug update failed')
    }
  }

  async componentDidMount() {
    try {
      const bugs = await getBugs(this.props.auth.getIdToken())
      this.setState({
        bugs,
        loadingBugs: false
      })
    } catch (e) {
      alert(`Failed to fetch bugs: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Bug Tracker</Header>

        {this.renderCreateBugInput()}

        {this.renderBugs()}
      </div>
    )
  }

  renderCreateBugInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Form>
            <FormField>
              <Input placeholder="Enter File name here..." onChange={this.handleNameChange} fluid />
              </FormField>
              <FormField> 
                <TextArea id="message" placeholder="Enter error code message/details here..." onChange={(e, { value }) =>
                 this.state.messageDetials = value as string } />
              </FormField>
              <FormField> 
                <Button color="green" onClick={this.onBugCreate}>New Bug</Button>
              </FormField>
              </Form>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderBugs() {
    if (this.state.loadingBugs) {
      return this.renderLoading()
    }

    return this.renderBugsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Bugs
        </Loader>
      </Grid.Row>
    )
  }

  renderBugsList() {
    return (
      <Grid padded>
        {this.state.bugs.map((bug, pos) => {
          return (
            <Grid.Row key={bug.bugId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onBugCheck(pos)}
                  checked={bug.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {bug.name}
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {bug.message}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {bug.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(bug.bugId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onBugDelete(bug.bugId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {bug.attachmentUrl && (
                <Image src={bug.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'Due by:mm-dd-yyyy') as string
  }
}
