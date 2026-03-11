## Download Git

1. Download Git from https://git-scm.com/install/

2. Move from Downloads folder and run the .exe

Follow the installation by clicking `next` in all the steps. **No admin rights needed**.


## Login in Git Enterprise account

In `Terminal`, type:

1. `git config --global --unset-all credential.helper` and press ENTER

2. `git config --global credential.helper manager-core`and press ENTER
  
3. `git credential reject`and press ENTER
  
4. `git ls-remote https://github.boschdevcloud.com/PGE3CA/Statistics-Center.git`and press ENTER

5. Browser with GitHub Bosch Dev Cloud will open for login


## Configuration in Visual Studio

1. Open the Terminal in VS Code

2. Type `git config --global user.name "Your Full Name"` and press ENTER

3. Type `git config --global user.email "your.email@company.com"` and press ENTER

4. Optional: verify if it worked, by typing `git config --global --list`