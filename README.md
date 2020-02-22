# Flack

This flask-based chat app uses socketIO to allow messages to be shown in real time without a page refresh.

## Set-up

Set-up a virtual environment and activate it:
```
python3 -m venv venv
source venv/bin/activate
```
You should see (venv) before your command prompt now. (You can type `deactivate`
to exit the virtual environment any time.)

Install the requirements:
```
pip install -r requirements.txt
```

Set up your environment variables:
```
touch .env
echo FLASK_APP="application.py" >> .env
```

## Usage

Make sure you are in the virtual environment (you should see (venv) before your
command prompt). If not `source /venv/bin/activate` to enter it.

```
Usage: flask run
```

## Screenshots

![](https://i.imgur.com/ZWpJymj.png)

![](https://i.imgur.com/o03PBS1.png)

![](https://i.imgur.com/olpK4uE.png)

## Credit

[HarvardX: CS50's Web Programming with Python and JavaScript](https://www.edx.org/course/cs50s-web-programming-with-python-and-javascript)

## License

Flack is licensed under the [MIT license](https://github.com/danrneal/flack/blob/master/LICENSE).
