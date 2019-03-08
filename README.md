# DreamRobot Adapter Description
> DreamRobot Node.js Adapter component for the [elastic.io platform](http://www.elastic.io "elastic.io platform")

This is the DreamRobot Adapter Component to connect your DreamRobot Account with any other Open Integration Hub component.
The Adapter currently supports DR customer exports.

## Before you Begin

To use the Adapter you have to use the DR REST API with user-credentials. In the first step, be sure you have those credentials or ask for them at support@dreamrobot.de.

## Getting Started

After registration and uploading of your SSH Key you can proceed to deploy it into our system. At this stage we suggest you to:
* [Create a team](http://go2.elastic.io/manage-teams) to work on your new component. This is not required but will be automatically created using random naming by our system so we suggest you name your team accordingly.
* [Create a repository](http://go2.elastic.io/manage-repositories) where your new component is going to *reside* inside the team that you have just created.

```bash
$ git clone https://github.com/elasticio/petstore-component-nodejs.git your-repository

$ cd your-repository
```
Now you can edit your version of **petstore-component-nodejs** component and build your desired component. Or you can just ``PUSH``it into our system to see the process in action:

```bash
$ git remote add elasticio your-team@git.elastic.io:your-repository.git

$ git push elasticio master
```
Obviously the naming of your team and repository is entirely up-to you and if you do not put any corresponding naming our system will auto generate it for you but the naming might not entirely correspond to your project requirements.

## File Structure

The structure of **petstore-component-nodejs** component is quite flexible. [elastic.io platform](https://www.elastic.io) expects only two files to be present in the main directory. These are the ``component.json`` and ``package.json``. Our documentation on [how to build a component in node.js](https://support.elastic.io/support/solutions/articles/14000027123-how-to-build-a-component-in-node-js) has more about each file and their function.
