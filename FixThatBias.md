
Fix that bias activity

The user will be presented with a case study that is a short summary of the methods for a study
- This will come in the form of ReactFlow instance being rendered with a particular set of data

each case study will have a research question with independent and dependent variables noted and displayed to the user

The user will be instructed to select a card and then click confirm to indicate the methods section where there is a potential issue. This requires them clicking on the node in the reactflow instance and hitting select. 
* The user will receive feedback about the correctness of their choice
    * The dataset will indicate which answers qualify as correct.
* The correct answer will be revealed and describe the problem with the methods.

Next phase:
The user will be presented with multiple possible solutions to the problem and in the form of cards at the bottom of the screen. These drag and drop enabled cards may be dragged onto reactflow nodes on the canvas and dropped on nodes (methods) on the canvas. In this case, they may only be dropped on nodes that were just marked as the correct answer. The user must place the correct solution on the node that was just identified. Incorrect selections (Dragging and dropping the wrong box) will turn the solution box red briefly then disable it. 
* The user will receive feedback about the correctness of their choice.
The user will be prompted to continue on to the next case study or the final results page if they are out of studies.


There will be a final results page that will indicate the statistics for the choices in each case study the user engaged with. (This will require as saving the user selections to our MongoDB database. We'll need to add a model for that. )



Additional interface features:
* Once a problem has been identified by a user, we need to be able to tell them if they picked the right card or not. This requires the ability to turn a card RED for “there’s a bigger problem elsewhere” or GREEN for “this is probably where the biggest problem is happening” in response to a user selections. This requires the ability to select a card that’s got a problem with it, and confirm the selection. 
* When a card is RED or GREEN, we need to give system text that advises what the next step it. On RED they try again. On GREEN they get to go to the next step. This requires the ability to display obvious and specifically colored (red for error or green for correct) text to the user no matter how their screen is looking at the diagram.
* They need the ability to also say that there aren’t any obvious problems with a presented study (we will have ~2 studies that are actually fine to reinforce that there has to be a point where you stop digging for more bias problems). This requires selection logic to flag these two special studies and ensures that the FIRST study displayed to a user always has a problem. This also requires a button that says “No Concerns.”
* Once they have successfully placed a card onto the grid users will continue to the next study or if they are out of studies for their session they will see a screen that displays a table for all the studies they saw. This requires a final page displaying a table that shows the study name, what the problem was, how many errors they made in solving the problem, and what the solution / result they chose is. 
* 


Additional notes:
Eventually, we'll want to preload a reactflow instance from the database itself but for now, lets just generate one on the fly using all of the methods text from the dataset. Have it generated on the spot by parsing the relevant methods data for the current case study in the dataset. on the 